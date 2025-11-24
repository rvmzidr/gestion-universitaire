(function () {
    // Client script to initialize FullCalendar and fetch events from /api/emplois
    // It expects window.__GROUPE_ID__ to be set by the template.

    let calendarInstance = null;

    function getNextDateForDay(jour) {
        const days = { dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6 };
        const target = days[jour] ?? 1;
        const d = new Date();
        const diff = (target + 7 - d.getDay()) % 7;
        const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
        return next.toISOString().slice(0, 10);
    }

    async function fetchEvents(groupeId) {
        const url = `/api/emplois?groupe=${encodeURIComponent(groupeId)}`;
        const res = await fetch(url, { credentials: 'same-origin' });
        if (!res.ok) {
            throw new Error('Erreur récupération emplois: ' + res.status);
        }
        return res.json();
    }

    function mapToFullCalendar(events) {
        return events.map(e => {
            const date = getNextDateForDay(e.jour || 'lundi');
            const start = `${date}T${(e.heure_debut || '08:00:00').slice(0,8)}`;
            const end = `${date}T${(e.heure_fin || '09:00:00').slice(0,8)}`;
            const color = (e.type_cours === 'td' ? '#6cb2eb' : (e.type_cours === 'tp' ? '#8ef28e' : '#f59e0b'));
            return {
                id: e.id,
                title: e.titre || (e.type_cours || 'Cours'),
                start,
                end,
                color,
                extendedProps: {
                    enseignant: e.enseignant_affichage || e.id_enseignant,
                    salle: e.salle_affichage || e.id_salle,
                    raw: e
                }
            };
        });
    }

    async function renderCalendar(groupeId) {
        const root = document.getElementById('fc-calendar');
        if (!root) return;

        try {
            const events = await fetchEvents(groupeId);
            const fcEvents = mapToFullCalendar(events);

            // If already initialized, remove and re-init
            if (calendarInstance) {
                calendarInstance.destroy();
                calendarInstance = null;
                root.innerHTML = '';
            }

            calendarInstance = new FullCalendar.Calendar(root, {
                initialView: 'timeGridWeek',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridWeek,timeGridDay'
                },
                slotMinTime: '07:00:00',
                slotMaxTime: '20:00:00',
                allDaySlot: false,
                events: fcEvents,
                eventDidMount: function(info) {
                    // add tooltip details
                    const el = info.el;
                    const enseignant = info.event.extendedProps.enseignant;
                    const salle = info.event.extendedProps.salle;
                    el.title = `${info.event.title}\n${enseignant ? 'Enseignant: ' + enseignant + '\n' : ''}${salle ? 'Salle: ' + salle : ''}`;
                }
            });

            calendarInstance.render();
        } catch (err) {
            console.error(err);
            const rootWrap = document.getElementById('fc-root');
            if (rootWrap) rootWrap.innerHTML = '<div class="info-card" style="border-left-color:var(--danger-color);">Erreur lors du chargement de l\'emploi du temps.</div>';
        }
    }

    // attach to toggle button
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.getElementById('toggle-interactive');
        const gid = window.__GROUPE_ID__;
        btn?.addEventListener('click', function () {
            if (!gid) {
                alert('Groupe introuvable — impossible d\'afficher l\'emploi du temps interactif.');
                return;
            }

            const root = document.getElementById('fc-root');
            const wrapper = document.querySelector('.calendar-wrapper');
            if (!root) return;

            if (root.style.display === 'none') {
                // show and render
                root.style.display = 'block';
                wrapper && (wrapper.style.display = 'none');
                // render calendar
                renderCalendar(gid);
                btn.textContent = 'Masquer mode interactif';
            } else {
                root.style.display = 'none';
                wrapper && (wrapper.style.display = 'flex');
                btn.textContent = 'Basculer en mode interactif';
            }
        });
    });
})();

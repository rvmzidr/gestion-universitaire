(function () {
    const normalize = (value) => (value || '').toString().trim().toLowerCase();

    const extractLevel = (label) => {
        const normalized = normalize(label);
        if (!normalized) {
            return 99;
        }

        if (/prem/i.test(normalized) || /1(?:er|ère|ere)/i.test(normalized)) {
            return 1;
        }
        if (/deux/i.test(normalized) || /second/i.test(normalized) || /2(?:e|eme|ème)/i.test(normalized)) {
            return 2;
        }
        if (/trois/i.test(normalized) || /3(?:e|eme|ème)/i.test(normalized)) {
            return 3;
        }

        const digit = normalized.match(/(\d+)/);
        if (digit && digit[1]) {
            const level = parseInt(digit[1], 10);
            return Number.isNaN(level) ? 99 : level;
        }

        return 99;
    };

    const reorderGroupOptions = (select, options) => {
        if (!select || !options.length) {
            return;
        }

        const placeholder = select.querySelector('option[value=""]');
        const sorted = [...options].sort((a, b) => {
            const levelA = extractLevel(a.dataset.nom || a.textContent || '');
            const levelB = extractLevel(b.dataset.nom || b.textContent || '');
            if (levelA !== levelB) {
                return levelA - levelB;
            }
            const nameA = normalize(a.dataset.nom || a.textContent || '');
            const nameB = normalize(b.dataset.nom || b.textContent || '');
            return nameA.localeCompare(nameB, 'fr');
        });

        select.innerHTML = '';
        if (placeholder) {
            select.appendChild(placeholder);
        }
        sorted.forEach((option) => select.appendChild(option));
    };

    const updateGroupPlaceholder = (select, hasSpecialite) => {
        if (!select) {
            return;
        }
        const placeholder = select.querySelector('option[value=""]');
        if (!placeholder) {
            return;
        }
        placeholder.textContent = hasSpecialite
            ? 'Sélectionnez un groupe lié à cette spécialité'
            : 'Sélectionnez un groupe';
    };

    const setDepartementFromSpecialite = (departSelect, specialiteOption) => {
        if (!departSelect || !specialiteOption) {
            return;
        }
        const deptId = specialiteOption.dataset.departement || '';
        if (deptId && departSelect.value !== deptId) {
            departSelect.value = deptId;
        }
    };

    const filterSpecialites = (departSelect, specialiteSelect, specialiteOptions) => {
        if (!specialiteSelect) {
            return;
        }

        const departId = departSelect ? departSelect.value : '';
        let hasVisibleSelection = false;

        specialiteOptions.forEach((option) => {
            const optionDept = option.dataset.departement || '';
            const visible = !departId || !optionDept || optionDept === departId;
            option.hidden = !visible;
            if (!visible && option.selected) {
                option.selected = false;
            }
            if (visible && option.selected) {
                hasVisibleSelection = true;
            }
        });

        if (!hasVisibleSelection) {
            specialiteSelect.value = '';
        }
    };

    const filterGroupes = (specialiteSelect, groupeSelect, groupeOptions) => {
        if (!specialiteSelect || !groupeSelect) {
            return;
        }

        const selectedOption = specialiteSelect.options[specialiteSelect.selectedIndex];
        const specialiteId = selectedOption ? selectedOption.value : '';
        const specialiteCode = selectedOption ? normalize(selectedOption.dataset.code) : '';
        const specialiteNom = selectedOption ? normalize(selectedOption.dataset.nom) : '';

        let hasVisibleSelection = false;

        groupeOptions.forEach((option) => {
            let visible = true;
            if (specialiteId) {
                const optionSpecialite = option.dataset.specialite || '';
                if (optionSpecialite) {
                    visible = optionSpecialite === specialiteId;
                } else {
                    const optionCode = normalize(option.dataset.code);
                    const optionName = normalize(option.dataset.nom || option.textContent);
                    visible = (
                        (specialiteCode && optionCode.includes(specialiteCode)) ||
                        (specialiteCode && optionName.includes(specialiteCode)) ||
                        (specialiteNom && optionName.includes(specialiteNom))
                    );
                }
            }
            option.hidden = !visible;
            if (!visible && option.selected) {
                option.selected = false;
            }
            if (visible && option.selected) {
                hasVisibleSelection = true;
            }
        });

        if (!hasVisibleSelection) {
            groupeSelect.value = '';
        }

        updateGroupPlaceholder(groupeSelect, Boolean(specialiteId));
    };

    document.addEventListener('DOMContentLoaded', () => {
        const departSelect = document.getElementById('id_departement');
        const specialiteSelect = document.getElementById('id_specialite');
        const groupeSelect = document.getElementById('id_groupe');

        if (!specialiteSelect || !groupeSelect) {
            return;
        }

        const specialiteOptions = Array.from(specialiteSelect.querySelectorAll('option')).filter((opt) => opt.value);
        const groupeOptions = Array.from(groupeSelect.querySelectorAll('option')).filter((opt) => opt.value);

        reorderGroupOptions(groupeSelect, groupeOptions);

        const initial = window.__ETUDIANT_FORM_DATA__ || {};
        if (departSelect && initial.departementId) {
            departSelect.value = initial.departementId;
        }
        if (initial.specialiteId) {
            specialiteSelect.value = initial.specialiteId;
        }
        if (initial.groupeId) {
            groupeSelect.value = initial.groupeId;
        }

        const syncAndFilter = () => {
            const selectedOption = specialiteSelect.options[specialiteSelect.selectedIndex];
            setDepartementFromSpecialite(departSelect, selectedOption);
            filterGroupes(specialiteSelect, groupeSelect, groupeOptions);
        };

        filterSpecialites(departSelect, specialiteSelect, specialiteOptions);
        syncAndFilter();

        if (departSelect) {
            departSelect.addEventListener('change', () => {
                filterSpecialites(departSelect, specialiteSelect, specialiteOptions);
                specialiteSelect.dispatchEvent(new Event('change'));
            });
        }

        specialiteSelect.addEventListener('change', syncAndFilter);

        updateGroupPlaceholder(groupeSelect, Boolean(specialiteSelect.value));
    });
})();

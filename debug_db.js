const db = require('./config/database');

async function debugDatabase() {
    try {
        console.log('🔍 ANALYSE DE LA BASE DE DONNÉES\n');
        console.log('='.repeat(60));
        
        // 1. Structure de la table enseignants
        console.log('\n📋 TABLE: enseignants');
        console.log('-'.repeat(60));
        const [enseignantsColumns] = await db.query('DESCRIBE enseignants');
        enseignantsColumns.forEach(col => {
            console.log(`  ${col.Field.padEnd(20)} | ${col.Type.padEnd(15)} | ${col.Null.padEnd(5)} | ${col.Key || ''}`);
        });
        
        // 2. Structure de la table etudiants
        console.log('\n📋 TABLE: etudiants');
        console.log('-'.repeat(60));
        const [etudiantsColumns] = await db.query('DESCRIBE etudiants');
        etudiantsColumns.forEach(col => {
            console.log(`  ${col.Field.padEnd(20)} | ${col.Type.padEnd(15)} | ${col.Null.padEnd(5)} | ${col.Key || ''}`);
        });
        
        // 3. Structure de la table utilisateurs
        console.log('\n📋 TABLE: utilisateurs');
        console.log('-'.repeat(60));
        const [utilisateursColumns] = await db.query('DESCRIBE utilisateurs');
        utilisateursColumns.forEach(col => {
            console.log(`  ${col.Field.padEnd(20)} | ${col.Type.padEnd(15)} | ${col.Null.padEnd(5)} | ${col.Key || ''}`);
        });
        
        // 4. Groupes disponibles
        console.log('\n📊 GROUPES DISPONIBLES:');
        console.log('-'.repeat(60));
        const [groupes] = await db.query('SELECT id, nom FROM groupes ORDER BY nom LIMIT 10');
        if (groupes.length > 0) {
            groupes.forEach(g => console.log(`  ${g.id} - ${g.nom}`));
        } else {
            console.log('  Aucun groupe trouvé');
        }
        
        // 5. Spécialités disponibles
        console.log('\n📊 SPÉCIALITÉS DISPONIBLES:');
        console.log('-'.repeat(60));
        const [specialites] = await db.query('SELECT id, nom FROM specialites ORDER BY nom LIMIT 10');
        if (specialites.length > 0) {
            specialites.forEach(s => console.log(`  ${s.id} - ${s.nom}`));
        } else {
            console.log('  Aucune spécialité trouvée');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Analyse terminée\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERREUR:', error.message);
        console.error(error);
        process.exit(1);
    }
}

debugDatabase();

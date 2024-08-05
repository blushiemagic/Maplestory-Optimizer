'use strict';

const features = Object.freeze({
    apMainStat: {
        name: 'AP (Basic)',
        category: '-main',
        dynamicName: true,
        include: [ 'base' ]
    },
    baseMainStat: {
        name: 'Base',
        category: '-main',
        dynamicName: true
    },
    percentMainStat: {
        name: 'Percent',
        category: '-main',
        dynamicName: true
    },
    finalMainStat: {
        name: 'Final',
        category: '-main',
        dynamicName: true,
        include: [ 'base', 'custom' ]
    },

    apSecondaryStat: {
        name: 'AP (Basic)',
        category: '-secondary',
        dynamicName: true,
        include: [ 'base' ]
    },
    baseSecondaryStat: {
        name: 'Base',
        category: '-secondary',
        dynamicName: true
    },
    percentSecondaryStat: {
        name: 'Percent',
        category: '-secondary',
        dynamicName: true
    },
    finalSecondaryStat: {
        name: 'Final',
        category: '-secondary',
        dynamicName: true,
        include: [ 'base', 'custom' ]
    },

    apThirdStat: {
        name: 'AP (Basic)',
        category: '-third',
        dynamicName: true,
        include: [ 'base' ]
    },
    baseThirdStat: {
        name: 'Base',
        category: '-third',
        dynamicName: true
    },
    percentThirdStat: {
        name: 'Percent',
        category: '-third',
        dynamicName: true
    },
    finalThirdStat: {
        name: 'Final',
        category: '-third',
        dynamicName: true,
        include: [ 'base', 'custom' ]
    },

    percentApStat: {
        name: 'Percent AP (Basic) Stats',
        category: 'All Stats / Attack',
        include: [ 'custom' ],
        isList: true
    },

    baseAttack: {
        name: 'Base Atk',
        category: 'All Stats / Attack',
    },
    percentAttack: {
        name: 'Percent Atk',
        category: 'All Stats / Attack',
    },
    finalAttack: {
        name: 'Final Atk',
        category: 'All Stats / Attack',
        include: [ 'base' ]
    },

    damage: {
        name: 'Damage',
        category: 'Other'
    },
    bossDamage: {
        name: 'Boss Damage',
        category: 'Other'
    },
    ied: {
        name: 'IED',
        category: 'Other',
        isList: true
    },
    critDamage: {
        name: 'Crit Damage',
        category: 'Other'
    }
});

const classes = {
    str: {
        main: 'STR',
        secondary: 'DEX'
    },
    dex: {
        main: 'DEX',
        secondary: 'STR'
    },
    int: {
        main: 'INT',
        secondary: 'LUK'
    },
    luk: {
        main: 'LUK',
        secondary: 'DEX'
    },
    luk2: {
        main: 'LUK',
        secondary: 'DEX',
        third: 'STR'
    },
    xenon: {
        main: 'STR',
        secondary: 'DEX',
        third: 'LUK'
    },
    da: {
        main: 'HP',
        secondary: 'STR'
    },
    kanna: {
        main: 'INT',
        secondary: 'LUK'
    }
};

function createData() {
    return {
        class: 'str',
        baseFeatures: createFeatureSet('base'),
        statusDamage: 0,
        familiarFeatures: createFeatureSet('familiar'),

        buffs: {
            mage: 0,
            cadena: 0,
            illium: 0,
            ark: 0,
            adele: 0,

            mapleWarrior: false,
            sharpEyes: false,
            advBlessing: false,

            guildCrit: 0,
            guildDamage: 0,
            guildBoss: 0,
            guildIed: 0,
            echo: false,

            monsterPark: false,
            guildBuff: 0,
            ursus: false,
            legion: false,
            statPill: false,
            smithing: false,
            advBossRush: false,
            candiedApple: false,

            tengu: false,
            fame: 0,
            home: 0
        },
        burst: {
            ab: 0,
            thief: 0,
            kain: 0,
            useOzRing: true,
            ozRingType: 'ror',
            ozRingLevel: 4,
            weaponAttack: 0,
            modifyOffBurst: true
        },

        customBuffs: [{
            active: true,
            name: '',
            features: [{
                feature: 'baseMainStat',
                value: 0
            }]
        }],
        customBurst: [{
            active: true,
            name: '',
            features: [{
                feature: 'baseMainStat',
                value: 0
            }]
        }],
        skills: []
    };
}

function createFeatureSet(name, emptyLists = false) {
    let featureSet = {};
    for (let feature in features) {
        let set = features[feature];
        if (!name || !set.include || set.include.includes(name)) {
            if (features[feature].isList) {
                featureSet[feature] = emptyLists ? [] : [0];
            } else {
                featureSet[feature] = 0;
            }
        }
    }
    return featureSet;
}

function cloneFeatureSet(featureSet) {
    let newFeatureSet = {};
    for (let feature in featureSet) {
        if (features[feature].isList) {
            newFeatureSet[feature] = [...featureSet[feature]];
        } else {
            newFeatureSet[feature] = featureSet[feature];
        }
    }
    return newFeatureSet;
}

function replaceText(text, classType) {
    if (!classType) {
        classType = 'str';
    }
    text = text.replace('-main', classes[classType].main);
    text = text.replace('-secondary', classes[classType].secondary);
    text = text.replace('-third', classes[classType].third || 'Third Stat');
    return text;
}

// calculations

function calculate() {
    forceValidateInputs();
    calculateUnbuffedStats();
    checkStat3();
    calculateUnbuffedAttack();
    document.getElementById('ied-total').innerHTML = Math.round(100 * calculateIedFromContainer('ied')) / 100;
    document.getElementById('weapon-attack').disabled = !document.getElementById('wj').checked;
    document.getElementById('weapon-attack').parentElement.hidden = !document.getElementById('wj').checked;

    updateData();
    let total = tallyFeatures();
    let totalBurst = tallyBurst(total);
    modifyOffBurst(total);
    let changes = tallyChanges();
    calculateTotals('', total);
    calculateTotals('-burst', totalBurst);
    insertScore(document.getElementById('score'), total, changes);
    insertScore(document.getElementById('score-burst'), totalBurst, changes);
    calculateEquivalencies('', total);
    calculateEquivalencies('burst-', totalBurst);
    calculateSkills(total, totalBurst, changes);
}

function getNumberValue(id, defaultValue = 0) {
    let value = document.getElementById(id).valueAsNumber;
    return isNaN(value) ? defaultValue : value;
}

function forceValidateInputs() {
    for (let input of document.querySelectorAll('input[type="number"]')) {
        if (isNaN(input.valueAsNumber)) {
            input.value = input.getAttribute('value') || 0;
        }
        if (input.min && input.valueAsNumber < input.min) {
            input.valueAsNumber = input.min;
        }
        if (input.max && input.valueAsNumber > input.max) {
            input.valueAsNumber = input.max;
        }
        let start = parseFloat(input.min) || 0;
        let step = parseFloat(input.step) || 1;
        let multiplier = 1 / step;
        input.valueAsNumber = start + Math.floor(multiplier * (input.valueAsNumber - start)) / multiplier;
    }
    for (let select of document.querySelectorAll('select')) {
        let valid = false;
        let options = select.querySelectorAll('option');
        for (let option of options) {
            if (select.value == option.value) {
                valid = true;
                break;
            }
        }
        if (!valid) {
            select.value = options[0].value;
        }
    }
}

function calculateUnbuffedStats() {
    for (let k = 1; k <= 3; k++) {
        let statAp = getNumberValue(`stat-${k}-ap`, 4);
        let statBase = getNumberValue(`stat-${k}-base`, 4);
        if (statBase < statAp) {
            document.getElementById(`stat-${k}-base`).valueAsNumber = statAp;
            statBase = statAp;
        }
        let statPercent = getNumberValue(`stat-${k}-percent`);
        let statFinal = getNumberValue(`stat-${k}-final`);
        let statTotal = Math.floor(statBase * (100 + statPercent) / 100) + statFinal;
        document.getElementById(`stat-${k}-total`).innerHTML = statTotal;
    }
}

function useThirdStat(classType) {
    if (!classType) {
        classType = data.class;
    }
    return classType == 'luk2' || classType == 'xenon';
}

function checkStat3() {
    let useStat3 = useThirdStat(document.getElementById('class').value);
    document.getElementById('unbuffed-stat-3').hidden = !useStat3;
    document.getElementById('familiar-stat-3').hidden = !useStat3;
    if (!useStat3) {
        document.getElementById('stat-3-total').innerHTML = 0;
    }
    document.getElementById('stat-3-ap').disabled = !useStat3;
    document.getElementById('stat-3-base').disabled = !useStat3;
    document.getElementById('stat-3-percent').disabled = !useStat3;
    document.getElementById('stat-3-final').disabled = !useStat3;
    document.getElementById('familiar-stat-3-base').disabled = !useStat3;
    document.getElementById('familiar-stat-3-percent').disabled = !useStat3;
    for (let optgroup of document.querySelectorAll('.label-third')) {
        optgroup.disabled = !useStat3;
        optgroup.hidden = !useStat3;
        let option = optgroup.nextElementSibling;
        while (option.tagName == 'OPTION') {
            option.disabled = !useStat3;
            option.hidden = !useStat3;
            option = option.nextElementSibling;
        }
    }
}

function calculateUnbuffedAttack() {
    let attackBase = getNumberValue('attack-base');
    let attackPercent = getNumberValue('attack-percent');
    let attackFinal = getNumberValue('attack-final');
    let attackTotal = Math.floor(attackBase * (100 + attackPercent) / 100) + attackFinal;
    document.getElementById('attack-total').innerHTML = attackTotal;
}

function calculateIedFromList(ieds) {
    // I hate javascript floating points...
    let defense = 10000;
    for (let ied of ieds) {
        if (ied > 0) {
            defense *= 10000 - 100 * ied;
            defense /= 10000;
        } else if (ied < 0) {
            defense *= 10000;
            defense /= 10000 + 100 * ied;
        }
    }
    return 100 - defense / 100;
}

function getIedList(containerId) {
    let inputs = document.getElementById(containerId).querySelectorAll('input[type="number"]');
    return Array.from(inputs).map(input => input.valueAsNumber);
}

function calculateIedFromContainer(containerId) {
    return calculateIedFromList(getIedList(containerId));
}

function updateData() {
    data.class = document.getElementById('class').value;

    let statComponents = [ 'ap', 'base', 'percent', 'final' ];
    let statTypes = [ 'MainStat', 'SecondaryStat', 'ThirdStat' ];
    for (let k = 0; k < statTypes.length; k++) {
        for (let component of statComponents) {
            data.baseFeatures[component + statTypes[k]] = getNumberValue(`stat-${k + 1}-${component}`);
        }
    }
    data.baseFeatures.baseAttack = getNumberValue('attack-base');
    data.baseFeatures.percentAttack = getNumberValue('attack-percent');
    data.baseFeatures.finalAttack = getNumberValue('attack-final');
    data.baseFeatures.damage = getNumberValue('damage');
    data.statusDamage = getNumberValue('status-damage');
    data.baseFeatures.bossDamage = getNumberValue('boss-damage');
    data.baseFeatures.critDamage = getNumberValue('crit-damage');
    data.baseFeatures.ied = getIedList('ied');

    statComponents = [ 'base', 'percent' ];
    for (let k = 0; k < statTypes.length; k++) {
        for (let component of statComponents) {
            data.familiarFeatures[component + statTypes[k]] = getNumberValue(`familiar-stat-${k + 1}-${component}`);
        }
    }
    data.familiarFeatures.baseAttack = getNumberValue('familiar-attack-base');
    data.familiarFeatures.percentAttack = getNumberValue('familiar-attack-percent');
    data.familiarFeatures.damage = getNumberValue('familiar-damage');
    data.familiarFeatures.bossDamage = getNumberValue('familiar-boss-damage');
    data.familiarFeatures.critDamage = getNumberValue('familiar-crit-damage');
    data.familiarFeatures.ied = getIedList('familiar-ied');

    data.buffs.mage = getNumberValue('mage');
    data.buffs.cadena = getNumberValue('cadena');
    data.buffs.illium = getNumberValue('illium');
    data.buffs.ark = getNumberValue('ark');
    data.buffs.adele = getNumberValue('adele');

    data.buffs.mapleWarrior = document.getElementById('maple-warrior-16').checked;
    data.buffs.sharpEyes = document.getElementById('sharp-eyes').checked;
    data.buffs.advBlessing = document.getElementById('advanced-blessing').checked;
    data.buffs.guildCrit = getNumberValue('guild-crit');
    data.buffs.guildDamage = getNumberValue('guild-damage');
    data.buffs.guildBoss = getNumberValue('guild-boss');
    data.buffs.guildIed = getNumberValue('guild-ied');
    data.buffs.echo = document.getElementById('echo').checked;

    data.buffs.monsterPark = document.getElementById('monster-park').checked;
    data.buffs.guildBuff = parseInt(document.getElementById('guild-buff').value);
    data.buffs.ursus = document.getElementById('ursus').checked;
    data.buffs.legion = document.getElementById('legion').checked;
    data.buffs.statPill = document.getElementById('stat-pill').checked;
    data.buffs.smithing = document.getElementById('smithing').checked;
    data.buffs.advBossRush = document.getElementById('adv-boss-rush').checked;
    data.buffs.candiedApple = document.getElementById('candied-apple').checked;
    data.buffs.tengu = document.getElementById('tengu').checked;
    data.buffs.fame = parseInt(document.getElementById('fame').value);
    data.buffs.home = getNumberValue('home');

    data.customBuffs = [];
    let customBuffs = document.getElementById('custom-buffs').querySelectorAll('.custom-buff-contents');
    for (let customBuff of customBuffs) {
        let buffData = {
            active: customBuff.querySelector('.active-input').checked,
            name: customBuff.querySelector('.name-input').value,
            features: []
        };
        let buffFeatures = customBuff.querySelectorAll('.buff-item');
        for (let buffFeature of buffFeatures) {
            let featureData = {
                feature: buffFeature.querySelector('select').value,
                value: buffFeature.querySelector('.damage-input').valueAsNumber
            };
            buffData.features.push(featureData);
        }
        data.customBuffs.push(buffData);
    }

    data.burst.thief = getNumberValue('thief');
    data.burst.ab = getNumberValue('ab');
    data.burst.kain = getNumberValue('kain');
    data.burst.useOzRing = document.getElementById('use-oz-ring').checked;
    if (document.getElementById('ror').checked) {
        data.burst.ozRingType = 'ror';
    } else if (document.getElementById('wj').checked) {
        data.burst.ozRingType = 'wj';
    } else if (document.getElementById('cont').checked) {
        data.burst.ozRingType = 'cont';
    } else {
        data.burst.ozRingType = 'ror';
    }
    data.burst.ozRingLevel = getNumberValue('oz-ring-level');
    data.burst.weaponAttack = getNumberValue('weapon-attack');
    data.burst.modifyOffBurst = document.getElementById('modify-off-burst').checked;

    data.customBurst = [];
    let customBurst = document.getElementById('custom-burst').querySelectorAll('.custom-buff-contents');
    for (let customBuff of customBurst) {
        let buffData = {
            active: customBuff.querySelector('.active-input').checked,
            name: customBuff.querySelector('.name-input').value,
            features: []
        };
        let buffFeatures = customBuff.querySelectorAll('.buff-item');
        for (let buffFeature of buffFeatures) {
            let featureData = {
                feature: buffFeature.querySelector('select').value,
                value: buffFeature.querySelector('.damage-input').valueAsNumber
            };
            buffData.features.push(featureData);
        }
        data.customBurst.push(buffData);
    }

    data.skills = [];
    let skills = document.getElementById('skills').querySelectorAll('.skill-contents');
    for (let skill of skills) {
        let skillData = {
            name: skill.querySelector('.name-input').value,
            burst: skill.querySelector('.burst-input').checked,
            features: []
        };
        let skillFeatures = skill.querySelectorAll('.buff-item');
        for (let skillFeature of skillFeatures) {
            let featureData = {
                feature: skillFeature.querySelector('select').value,
                value: skillFeature.querySelector('.damage-input').valueAsNumber
            };
            skillData.features.push(featureData);
        }
        data.skills.push(skillData);
    }

    localStorage.setItem('data', JSON.stringify(data));
}

function fillFormWithData(data) {
    document.getElementById('class').value = data.class;

    let statComponents = [ 'ap', 'base', 'percent', 'final' ];
    let statTypes = [ 'MainStat', 'SecondaryStat', 'ThirdStat' ];
    for (let k = 0; k < statTypes.length; k++) {
        for (let component of statComponents) {
            document.getElementById(`stat-${k + 1}-${component}`).valueAsNumber = data.baseFeatures[component + statTypes[k]];
        }
    }
    document.getElementById('attack-base').valueAsNumber = data.baseFeatures.baseAttack;
    document.getElementById('attack-percent').valueAsNumber = data.baseFeatures.percentAttack;
    document.getElementById('attack-final').valueAsNumber = data.baseFeatures.finalAttack;
    document.getElementById('damage').valueAsNumber = data.baseFeatures.damage;
    document.getElementById('status-damage').valueAsNumber = data.statusDamage;
    document.getElementById('boss-damage').valueAsNumber = data.baseFeatures.bossDamage;
    document.getElementById('crit-damage').valueAsNumber = data.baseFeatures.critDamage;
    let ied = document.getElementById('ied');
    for (let item of ied.querySelectorAll('.inline-item')) {
        ied.removeChild(item);
    }
    for (let value of data.baseFeatures.ied) {
        insertTemplate(ied, 'ied-item', ied.lastElementChild);
        ied.lastElementChild.previousElementSibling.firstElementChild.valueAsNumber = value;
    }

    statComponents = [ 'base', 'percent' ];
    for (let k = 0; k < statTypes.length; k++) {
        for (let component of statComponents) {
            document.getElementById(`familiar-stat-${k + 1}-${component}`).valueAsNumber = data.familiarFeatures[component + statTypes[k]];
        }
    }
    document.getElementById('familiar-attack-base').valueAsNumber = data.familiarFeatures.baseAttack;
    document.getElementById('familiar-attack-percent').valueAsNumber = data.familiarFeatures.percentAttack;
    document.getElementById('familiar-damage').valueAsNumber = data.familiarFeatures.damage;
    document.getElementById('familiar-boss-damage').valueAsNumber = data.familiarFeatures.bossDamage;
    document.getElementById('familiar-crit-damage').valueAsNumber = data.familiarFeatures.critDamage;
    ied = document.getElementById('familiar-ied');
    for (let item of ied.querySelectorAll('.inline-item')) {
        ied.removeChild(item);
    }
    for (let value of data.familiarFeatures.ied) {
        insertTemplate(ied, 'ied-item', ied.lastElementChild);
        ied.lastElementChild.previousElementSibling.firstElementChild.valueAsNumber = value;
    }

    document.getElementById('mage').valueAsNumber = data.buffs.mage;
    document.getElementById('cadena').valueAsNumber = data.buffs.cadena;
    document.getElementById('illium').valueAsNumber = data.buffs.illium;
    document.getElementById('ark').valueAsNumber = data.buffs.ark;
    document.getElementById('adele').valueAsNumber = data.buffs.adele;

    document.getElementById('maple-warrior-16').checked = data.buffs.mapleWarrior;
    document.getElementById('sharp-eyes').checked = data.buffs.sharpEyes;
    document.getElementById('advanced-blessing').checked = data.buffs.advBlessing;
    document.getElementById('guild-crit').valueAsNumber = data.buffs.guildCrit;
    document.getElementById('guild-damage').valueAsNumber = data.buffs.guildDamage;
    document.getElementById('guild-boss').valueAsNumber = data.buffs.guildBoss;
    document.getElementById('guild-ied').valueAsNumber = data.buffs.guildIed;
    document.getElementById('echo').checked = data.buffs.echo;

    document.getElementById('monster-park').checked = data.buffs.monsterPark;
    document.getElementById('guild-buff').value = data.buffs.guildBuff.toString();
    document.getElementById('ursus').checked = data.buffs.ursus;
    document.getElementById('legion').checked = data.buffs.legion;
    document.getElementById('stat-pill').checked = data.buffs.statPill;
    document.getElementById('smithing').checked = data.buffs.smithing;
    document.getElementById('adv-boss-rush').checked = data.buffs.advBossRush;
    document.getElementById('candied-apple').checked = data.buffs.candiedApple;
    document.getElementById('tengu').checked = data.buffs.tengu;
    document.getElementById('fame').value = data.buffs.fame.toString();
    document.getElementById('home').valueAsNumber = data.buffs.home;

    let customBuffs = document.getElementById('custom-buffs');
    for (let item of customBuffs.querySelectorAll('.custom-buff')) {
        customBuffs.removeChild(item);
    }
    for (let buffData of data.customBuffs) {
        insertTemplate(customBuffs, 'custom-buff', customBuffs.lastElementChild);
        let customBuff = customBuffs.lastElementChild.previousElementSibling.firstElementChild;
        customBuff.querySelector('.active-input').checked = buffData.active;
        customBuff.querySelector('.name-input').value = buffData.name;
        let buffFeatures = customBuff.querySelector('.buff-items');
        for (let item of buffFeatures.querySelectorAll('.buff-item')) {
            buffFeatures.removeChild(item);
        }
        for (let featureData of buffData.features) {
            insertTemplate(buffFeatures, 'buff-item', buffFeatures.lastElementChild);
            let buffFeature = buffFeatures.lastElementChild.previousElementSibling;
            buffFeature.querySelector('select').value = featureData.feature;
            buffFeature.querySelector('.damage-input').valueAsNumber = featureData.value;
        }
    }

    document.getElementById('thief').valueAsNumber = data.burst.thief;
    document.getElementById('ab').valueAsNumber = data.burst.ab;
    document.getElementById('kain').valueAsNumber = data.burst.kain;
    document.getElementById('use-oz-ring').checked = data.burst.useOzRing;
    document.getElementById('ror').checked = data.burst.ozRingType == 'ror';
    document.getElementById('wj').checked = data.burst.ozRingType == 'wj';
    document.getElementById('cont').checked = data.burst.ozRingType == 'cont';
    document.getElementById('oz-ring-level').valueAsNumber = data.burst.ozRingLevel;
    document.getElementById('weapon-attack').valueAsNumber = data.burst.weaponAttack;
    document.getElementById('modify-off-burst').checked = data.burst.modifyOffBurst;

    let customBurst = document.getElementById('custom-burst');
    for (let item of customBurst.querySelectorAll('.custom-buff')) {
        customBurst.removeChild(item);
    }
    for (let buffData of data.customBurst) {
        insertTemplate(customBurst, 'custom-buff', customBurst.lastElementChild);
        let customBuff = customBurst.lastElementChild.previousElementSibling.firstElementChild;
        customBuff.querySelector('.active-input').checked = buffData.active;
        customBuff.querySelector('.name-input').value = buffData.name;
        let buffFeatures = customBuff.querySelector('.buff-items');
        for (let item of buffFeatures.querySelectorAll('.buff-item')) {
            buffFeatures.removeChild(item);
        }
        for (let featureData of buffData.features) {
            insertTemplate(buffFeatures, 'buff-item', buffFeatures.lastElementChild);
            let buffFeature = buffFeatures.lastElementChild.previousElementSibling;
            buffFeature.querySelector('select').value = featureData.feature;
            buffFeature.querySelector('.damage-input').valueAsNumber = featureData.value;
        }
    }

    let skills = document.getElementById('skills');
    for (let item of skills.querySelectorAll('.skill')) {
        skills.removeChild(item);
    }
    for (let skillData of data.skills) {
        insertTemplate(skills, 'skill', skills.lastElementChild);
        let skill = skills.lastElementChild.previousElementSibling.firstElementChild;
        skill.querySelector('.name-input').value = skillData.name;
        skill.querySelector('.burst-input').checked = skillData.burst;
        let buffFeatures = skill.querySelector('.buff-items');
        for (let item of buffFeatures.querySelectorAll('.buff-item')) {
            buffFeatures.removeChild(item);
        }
        for (let featureData of skillData.features) {
            insertTemplate(buffFeatures, 'buff-item', buffFeatures.lastElementChild);
            let buffFeature = buffFeatures.lastElementChild.previousElementSibling;
            buffFeature.querySelector('select').value = featureData.feature;
            buffFeature.querySelector('.damage-input').valueAsNumber = featureData.value;
        }
    }
}

function tallyFeatures() {
    let featureSet = createFeatureSet(null, true);
    for (let feature in data.baseFeatures) {
        if (features[feature].isList) {
            featureSet[feature].push(...data.baseFeatures[feature]);
        } else {
            featureSet[feature] += data.baseFeatures[feature];
        }
    }
    featureSet.damage += data.statusDamage;
    for (let feature in data.familiarFeatures) {
        if (features[feature].isList) {
            featureSet[feature].push(...data.familiarFeatures[feature]);
        } else {
            featureSet[feature] += data.familiarFeatures[feature];
        }
    }

    if (data.buffs.mage > 0) {
        let value = 3 * Math.ceil(data.buffs.mage / 2);
        featureSet.damage += value;
        featureSet.ied.push(value);
    }
    featureSet.damage += 3 * data.buffs.cadena;
    featureSet.damage += 6 * data.buffs.illium;
    if (data.buffs.ark > 0) {
        featureSet.damage += 1 + 5 * data.buffs.ark;
    }
    featureSet.damage += 3 * data.buffs.adele;

    featureSet.percentApStat.push(data.buffs.mapleWarrior ? 16 : 15);
    if (data.buffs.sharpEyes) {
        featureSet.critDamage += 8;
    }
    if (data.buffs.advBlessing) {
        featureSet.baseAttack += 20;
    }
    featureSet.critDamage += 2 * data.buffs.guildCrit;
    featureSet.damage += 2 * data.buffs.guildDamage;
    featureSet.bossDamage += 2 * data.buffs.guildBoss;
    if (data.buffs.guildIed > 0) {
        featureSet.ied.push(2 * data.buffs.guildIed);
    }
    if (data.buffs.echo) {
        featureSet.percentAttack += 4;
    }

    if (data.buffs.monsterPark) {
        featureSet.baseAttack += 30;
    }
    featureSet.baseAttack += data.buffs.guildBuff;
    if (data.buffs.ursus) {
        featureSet.baseAttack += 30;
    }
    if (data.buffs.legion) {
        featureSet.baseAttack += 30;
    }
    if (data.buffs.statPill) {
        featureSet.baseMainStat += 30;
    }
    if (data.buffs.smithing) {
        featureSet.critDamage += 5;
    }
    if (data.buffs.advBossRush) {
        featureSet.bossDamage += 20;
    }
    if (data.buffs.candiedApple) {
        featureSet.baseMainStat += 7;
        featureSet.baseSecondaryStat += 7;
        featureSet.baseThirdStat += 7;
    }
    if (data.buffs.tengu) {
        featureSet.baseAttack += 20;
    }
    featureSet.baseAttack += data.buffs.fame;
    if (data.buffs.home > 0) {
        featureSet.bossDamage += 9 + data.buffs.home;
    }

    for (let customBuff of data.customBuffs) {
        if (customBuff.active) {
            for (let buffFeature of customBuff.features) {
                if (features[buffFeature.feature].isList) {
                    featureSet[buffFeature.feature].push(buffFeature.value);
                } else {
                    featureSet[buffFeature.feature] += buffFeature.value;
                }
            }
        }
    }

    return featureSet;
}

function tallyBurst(offBurst) {
    let featureSet = cloneFeatureSet(offBurst);

    featureSet.damage += 3 * data.burst.thief;
    if (data.burst.ab > 0) {
        featureSet.damage += 15 * (data.burst.ab + 1);
    }
    if (data.burst.kain > 0) {
        featureSet.damage += 1 + 8 * data.burst.kain;
    }
    if (data.burst.useOzRing && data.burst.ozRingLevel > 0) {
        if (data.burst.ozRingType == 'ror') {
            let effectiveLevel = Math.min(data.burst.ozRingLevel, 4);
            featureSet.percentAttack += 25 * effectiveLevel;
        } else if (data.burst.ozRingType == 'wj') {
            let effectiveLevel = Math.min(data.burst.ozRingLevel, 4);
            featureSet.baseMainStat += effectiveLevel * data.burst.weaponAttack;
        } else if (data.burst.ozRingType == 'cont') {
            featureSet.bossDamage += 35 * data.burst.ozRingLevel;
            if (data.burst.ozRingLevel >= 5) {
                featureSet.bossDamage -= 15;
            }
            featureSet.percentAttack += 2 * (data.burst.ozRingLevel + 1);
        }
    }

    for (let customBuff of data.customBurst) {
        if (customBuff.active) {
            for (let buffFeature of customBuff.features) {
                if (features[buffFeature.feature].isList) {
                    featureSet[buffFeature.feature].push(buffFeature.value);
                } else {
                    featureSet[buffFeature.feature] += buffFeature.value;
                }
            }
        }
    }

    return featureSet;
}

function modifyOffBurst(offBurst) {
    if (data.burst.modifyOffBurst) {
        offBurst.damage += 1.5 * data.burst.thief;
        if (data.burst.useOzRing && data.burst.ozRingLevel > 0 && data.burst.ozRingType == 'cont') {
            let bossDamage = 35 * data.burst.ozRingLevel;
            if (data.burst.ozRingLevel >= 5) {
                bossDamage -= 15;
            }
            let percentAttack = 2 * (data.burst.ozRingLevel + 1);
            let effectiveLevel = Math.min(data.burst.ozRingLevel, 4);
            let ratio = (4 + effectiveLevel) / 12;
            offBurst.bossDamage += ratio * bossDamage;
            offBurst.percentAttack += ratio * percentAttack;
        }
    }
}

function tallyChanges() {
    let featureSet = createFeatureSet(null, true);
    let hasChanges = false;

    let gains = document.getElementById('gains').querySelectorAll('.buff-item');
    for (let gain of gains) {
        let feature = gain.querySelector('select').value;
        let value = gain.querySelector('.damage-input').valueAsNumber;
        if (value != 0) {
            if (features[feature].isList) {
                featureSet[feature].push(value);
            } else {
                featureSet[feature] += value;
            }
            hasChanges = true;
        }
    }

    let losses = document.getElementById('losses').querySelectorAll('.buff-item');
    for (let loss of losses) {
        let feature = loss.querySelector('select').value;
        let value = loss.querySelector('.damage-input').valueAsNumber;
        if (value != 0) {
            if (features[feature].isList) {
                featureSet[feature].push(-value);
            } else {
                featureSet[feature] -= value;
            }
            hasChanges = true;
        }
    }

    return hasChanges ? featureSet : null;
}

function calculateTotals(resultType, featureTotals) {
    let statTypes = [ 'MainStat', 'SecondaryStat', 'ThirdStat' ];
    let usingThirdStat = useThirdStat();
    for (let k = 0; k < statTypes.length; k++) {
        let fromPercentAp = 0;
        for (let percent of featureTotals.percentApStat) {
            fromPercentAp += Math.floor(featureTotals['ap' + statTypes[k]] * percent / 100);
        }
        document.getElementById(`result${resultType}-stat-${k + 1}-base`).innerHTML = featureTotals['base' + statTypes[k]] + fromPercentAp;
        document.getElementById(`result${resultType}-stat-${k + 1}-percent`).innerHTML = featureTotals['percent' + statTypes[k]];
        document.getElementById(`result${resultType}-stat-${k + 1}-final`).innerHTML = featureTotals['final' + statTypes[k]];
    }
    if (!usingThirdStat) {
        document.getElementById(`result${resultType}-stat-3-base`).innerHTML = '0';
        document.getElementById(`result${resultType}-stat-3-percent`).innerHTML = '0';
        document.getElementById(`result${resultType}-stat-3-final`).innerHTML = '0';
    }
    document.getElementById(`result${resultType}-stat-3-base`).parentElement.hidden = !usingThirdStat;
    document.getElementById(`result${resultType}-stat-3-percent`).parentElement.hidden = !usingThirdStat;
    document.getElementById(`result${resultType}-stat-3-final`).parentElement.hidden = !usingThirdStat;

    document.getElementById(`result${resultType}-attack-base`).innerHTML = featureTotals.baseAttack;
    document.getElementById(`result${resultType}-attack-percent`).innerHTML = Math.round(featureTotals.percentAttack * 100) / 100;
    document.getElementById(`result${resultType}-attack-final`).innerHTML = featureTotals.finalAttack;
    document.getElementById(`result${resultType}-attack-final`).parentElement.hidden = featureTotals.finalAttack == 0;

    document.getElementById(`result${resultType}-crit-damage`).innerHTML = featureTotals.critDamage;
    document.getElementById(`result${resultType}-damage`).innerHTML = featureTotals.damage;
    document.getElementById(`result${resultType}-boss-damage`).innerHTML = Math.round(featureTotals.bossDamage * 100) / 100;
    document.getElementById(`result${resultType}-ied`).innerHTML = Math.round(100 * calculateIedFromList(featureTotals.ied)) / 100;
}

function calculateEquivalencies(resultType, featureTotals) {
    let usingThirdStat = useThirdStat();
    let base = calculateScore(featureTotals);
    let test = cloneFeatureSet(featureTotals);
    test.baseMainStat += 1;
    let normalize = calculateScore(test) - base;

    function getEquivalency(test) {
        return parseFloat(((calculateScore(test) - base) / normalize).toFixed(2));
    }

    test = cloneFeatureSet(featureTotals);
    test.percentMainStat += 1;
    document.getElementById(resultType + 'equivalencies-stat-1-percent').innerHTML = getEquivalency(test);

    test = cloneFeatureSet(featureTotals);
    test.percentSecondaryStat += 1;
    document.getElementById(resultType + 'equivalencies-stat-2-percent').innerHTML = getEquivalency(test);

    let element = document.getElementById(resultType + 'equivalencies-stat-3-percent');
    if (usingThirdStat) {
        test = cloneFeatureSet(featureTotals);
        test.percentThirdStat += 1;
        element.innerHTML = getEquivalency(test);
    } else {
        element.innerHTML = '0';
    }
    element.parentElement.hidden = !usingThirdStat;

    test = cloneFeatureSet(featureTotals);
    test.percentMainStat += 1;
    test.percentSecondaryStat += 1;
    test.percentThirdStat += 1;
    document.getElementById(resultType + 'equivalencies-stat-all-percent').innerHTML = getEquivalency(test);

    test = cloneFeatureSet(featureTotals);
    test.baseSecondaryStat += 1;
    let equivalency = parseFloat((normalize / (calculateScore(test) - base)).toFixed(2));
    document.getElementById(resultType + 'equivalencies-stat-2-base').innerHTML = equivalency;

    element = document.getElementById(resultType + 'equivalencies-stat-3-base');
    if (usingThirdStat) {
        test = cloneFeatureSet(featureTotals);
        test.baseThirdStat += 1;
        equivalency = parseFloat((normalize / (calculateScore(test) - base)).toFixed(2));
        element.innerHTML = equivalency;
    } else {
        element.innerHTML = 'X';
    }
    element.parentElement.parentElement.hidden = !usingThirdStat;

    test = cloneFeatureSet(featureTotals);
    test.finalMainStat += 1;
    equivalency = parseFloat((normalize / (calculateScore(test) - base)).toFixed(2));
    document.getElementById(resultType + 'equivalencies-stat-1-final').innerHTML = equivalency;

    test = cloneFeatureSet(featureTotals);
    test.baseAttack += 1;
    document.getElementById(resultType + 'equivalencies-attack-base').innerHTML = getEquivalency(test);

    test = cloneFeatureSet(featureTotals);
    test.percentAttack += 1;
    document.getElementById(resultType + 'equivalencies-attack-percent').innerHTML = getEquivalency(test);

    test = cloneFeatureSet(featureTotals);
    test.damage += 1;
    document.getElementById(resultType + 'equivalencies-damage').innerHTML = getEquivalency(test);

    test = cloneFeatureSet(featureTotals);
    test.critDamage += 1;
    document.getElementById(resultType + 'equivalencies-crit-damage').innerHTML = getEquivalency(test);

    test = cloneFeatureSet(featureTotals);
    test.ied.push(1);
    document.getElementById(resultType + 'equivalencies-ied').innerHTML = getEquivalency(test);
}

function calculateScore(featureTotals) {
    //rounding probably isn't ideal for optimization
    let statTypes = [ 'MainStat', 'SecondaryStat', 'ThirdStat' ];
    let stats = [ 0, 0, 0 ];
    for (let k = 0; k < statTypes.length; k++) {
        stats[k] = featureTotals['base' + statTypes[k]];
        for (let percent of featureTotals.percentApStat) {
            let round = percent >= 0 ? Math.floor : Math.ceil;
            stats[k] += round(featureTotals['ap' + statTypes[k]] * percent / 100);
        }
        //stats[k] = Math.floor(stats[k] * (100 + featureTotals['percent' + statTypes[k]]) / 100);
        stats[k] = stats[k] * (100 + featureTotals['percent' + statTypes[k]]) / 100;
        stats[k] += featureTotals['final' + statTypes[k]];
    }
    let statScore;
    if (data.class == 'da') {
        //statScore = Math.floor(featureTotals['apMainStat'] / 3.5)
        //    + 0.8 * Math.floor((stats[0] - featureTotals['apMainStat']) / 3.5) + stats[1];
        statScore = featureTotals['apMainStat'] / 3.5 + 0.8 * (stats[0] - featureTotals['apMainStat']) / 3.5 + stats[1];
    } else if (data.class == 'xenon') {
        statScore = 4 * (stats[0] + stats[1] + stats[2]);
    } else {
        statScore = 4 * stats[0] + stats[1];
        if (useThirdStat()) {
            statScore += stats[2];
        }
    }

    //let attackScore = Math.floor(featureTotals.baseAttack * (100 + featureTotals.percentAttack) / 100);
    let attackScore = featureTotals.baseAttack * (100 + featureTotals.percentAttack) / 100;
    attackScore += featureTotals.finalAttack;
    let critDamageScore = 135 + featureTotals.critDamage;
    let damageScore = 100 + featureTotals.damage + featureTotals.bossDamage;
    let iedScore = 10000 - getNumberValue('defense') * (100 - calculateIedFromList(featureTotals.ied));

    let totalScore = statScore * attackScore / 100 * critDamageScore / 100 * damageScore / 100 * iedScore / 10000;
    return Math.max(totalScore, 1);
}

function insertScore(element, featureTotals, changes) {
    let totalScore = calculateScore(featureTotals);
    let totalScoreString = Math.round(totalScore).toLocaleString();
    element.innerHTML = totalScoreString;

    if (changes) {
        let changedTotals = cloneFeatureSet(featureTotals);
        for (let feature in changes) {
            if (features[feature].isList) {
                for (let item of changes[feature]) {
                    changedTotals[feature].push(item);
                }
            } else {
                changedTotals[feature] += changes[feature];
            }
        }
        let changedScore = calculateScore(changedTotals);
        let changedScoreString = Math.round(changedScore).toLocaleString();
        let percentChange = 100 * (changedScore - totalScore) / changedScore;
        let percentChangeString = percentChange.toFixed(2);
        if (percentChange >= 0) {
            percentChangeString = '+' + percentChangeString;
        }
        let span = document.createElement('span');
        span.innerHTML  = ' > ' + changedScoreString + ' (' + percentChangeString + '%)';
        span.className = changedScore >= totalScore ? 'gain' : 'loss';
        element.appendChild(span);
    }
}

function calculateSkills(featureTotals, burstTotals, changes) {
    let table = document.getElementById('results').querySelector('tbody');
    for (let row of table.querySelectorAll('.skill-row')) {
        table.removeChild(row);
    }
    for (let skillData of data.skills) {
        let row = document.createElement('tr');
        row.className = 'skill-row';
        let cell = document.createElement('th');
        cell.appendChild(document.createTextNode(skillData.name));
        row.appendChild(cell);

        cell = document.createElement('td');
        if (skillData.burst) {
            cell.innerHTML = 'N/A';
        } else {
            let skillTotals = cloneFeatureSet(featureTotals);
            for (let skillFeature of skillData.features) {
                if (features[skillFeature.feature].isList) {
                    skillTotals[skillFeature.feature].push(skillFeature.value);
                } else {
                    skillTotals[skillFeature.feature] += skillFeature.value;
                }
            }
            insertScore(cell, skillTotals, changes);
        }
        row.appendChild(cell);

        cell = document.createElement('td');
        let skillTotals = cloneFeatureSet(burstTotals);
        for (let skillFeature of skillData.features) {
            if (features[skillFeature.feature].isList) {
                skillTotals[skillFeature.feature].push(skillFeature.value);
            } else {
                skillTotals[skillFeature.feature] += skillFeature.value;
            }
        }
        insertScore(cell, skillTotals, changes);
        row.appendChild(cell);
        table.appendChild(row);
    }
}

// events and event helpers

function replaceTextInHtml() {
    let types = [ 'main', 'secondary' ];
    if (useThirdStat()) {
        types.push('third');
    }
    for (let type of types) {
        let text = classes[data.class][type];
        for (let container of document.querySelectorAll('.inner-' + type)) {
            container.innerHTML = text;
        }
        for (let container of document.querySelectorAll('.label-' + type)) {
            container.label = text;
        }
        for (let label of document.querySelectorAll('.aria-label-ap-' + type)) {
            label.ariaLabel = 'AP (Basic) ' + text;
        }
        for (let label of document.querySelectorAll('.aria-label-base-' + type)) {
            label.ariaLabel = 'Base ' + text;
        }
        for (let label of document.querySelectorAll('.aria-label-percent-' + type)) {
            label.ariaLabel = 'Percent ' + text;
        }
        for (let label of document.querySelectorAll('.aria-label-final-' + type)) {
            label.ariaLabel = 'Final ' + text;
        }
    }
}

function getTemplate(id) {
    return document.getElementById(id).cloneNode(true);
}

function insertTemplate(parent, templateId, child) {
    if (templateId == 'feature-options') {
        let categories = {};
        for (let feature in features) {
            let properties = features[feature];
            if (!properties.include || properties.include.includes('custom')) {
                if (!categories.hasOwnProperty(properties.category)) {
                    categories[properties.category] = [];
                }
                categories[properties.category].push(feature);
            }
        }
        for (let category in categories) {
            let optgroup = document.createElement('optgroup');
            console.log(data);
            optgroup.label = replaceText(category, data.class);
            if (category.startsWith('-')) {
                optgroup.classList.add('label' + category);
            }
            parent.appendChild(optgroup);
            for (let feature of categories[category]) {
                let option = document.createElement('option');
                option.value = feature;
                let name = features[feature].name;
                if (features[feature].dynamicName) {
                    name += ' ';
                }
                option.appendChild(document.createTextNode(name));
                if (features[feature].dynamicName) {
                    let span = document.createElement('span');
                    span.innerHTML = replaceText(category, data.class);
                    span.classList.add('inner' + category);
                    option.appendChild(span);
                }
                parent.appendChild(option);
            }
        }
    } else {
        let template = getTemplate(templateId);
        while (template.hasChildNodes()) {
            let node = template.firstChild;
            template.removeChild(node);
            parent.insertBefore(node, child);
        }
    }
}

function addIedItem(event) {
    insertTemplate(event.target.parentNode, 'ied-item', event.target);
}

function addBuff(event) {
    insertTemplate(event.target.parentNode, 'custom-buff', event.target);
}

function addStatBoost(event) {
    insertTemplate(event.target.parentNode, 'buff-item', event.target);
}

function addSkill(event) {
    insertTemplate(event.target.parentNode, 'skill', event.target);
}

function deleteParent(event) {
    event.target.parentNode.parentNode.removeChild(event.target.parentNode);
    calculate();
}

function setDefense(defense) {
    document.getElementById('defense').valueAsNumber = defense;
    calculate();
}

function openImport() {
    document.getElementById('open-import').disabled = true;
    document.getElementById('open-export').disabled = true;
    document.getElementById('import').hidden = false;
}

function openExport() {
    document.getElementById('open-import').disabled = true;
    document.getElementById('open-export').disabled = true;
    document.getElementById('export').hidden = false;
    let exportField = document.getElementById('export-field');
    exportField.value = JSON.stringify(data);
    exportField.select();
}

function doImport() {
    try {
        let newData = JSON.parse(document.getElementById('import-field').value);
        fillFormWithData(newData);
        data = newData;
        closeImport();
        calculate();
        window.alert('Import success');
    } catch (e) {
        fillFormWithData(data);
        calculate();
        window.alert('Import failed');
    }
}

function copyExport() {
    navigator.clipboard.writeText(JSON.stringify(data)).then(() => {
        window.alert('Copied to Clipboard');
    });
}

function fixExport(event) {
    let exportField = document.getElementById('export-field');
    exportField.value = JSON.stringify(data);
    exportField.select();
    event.stopPropagation();
}

function closeImport() {
    document.getElementById('open-import').disabled = false;
    document.getElementById('open-export').disabled = false;
    document.getElementById('import').hidden = true;
    document.getElementById('import-field').value = '';
}

function closeExport() {
    document.getElementById('open-import').disabled = false;
    document.getElementById('open-export').disabled = false;
    document.getElementById('export').hidden = true;
    document.getElementById('export-field').value = '';
}

// load

let data = createData();
window.addEventListener('load', () => {
    document.getElementById('form').addEventListener('change', calculate, true);
    document.getElementById('class').addEventListener('change', replaceTextInHtml);

    let containers = document.querySelectorAll('[template]');
    while (containers.length > 0) {
        for (let container of containers) {
            insertTemplate(container.parentNode, container.getAttribute('template'), container);
            container.parentNode.removeChild(container);
        }
        containers = document.querySelectorAll('[template]');
    }

    let error = false;
    try {
        data = JSON.parse(localStorage.getItem('data'));
        fillFormWithData(data);
    } catch {
        //localStorage.removeItem('data');
        error = true;
    }
    if (!data || error) {
        data = createData();
        fillFormWithData(data);
    }
    calculate();
    replaceTextInHtml();
});

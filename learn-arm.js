// Script for Adjustable-Rate Mortgage learning page

let currentArm = null;
let sofrIndex = null;

const SOFR_URL = 'https://api.stlouisfed.org/fred/series/observations?series_id=SOFR30DAYAVG&api_key=03051679d69cfd03b06a38476b54acae&file_type=json&sort_order=desc&limit=1';

document.addEventListener('DOMContentLoaded', () => {
    fetch('armtable.csv')
        .then(response => response.text())
        .then(text => {
            const arms = parseArmCSV(text);
            populateSelect(arms);
        })
        .catch(err => console.error('Error loading ARM data:', err));

    fetchSofrIndex();

    const btn = document.getElementById('simulate-btn');
    if (btn) btn.addEventListener('click', simulateRate);
});

async function fetchSofrIndex() {
    const el = document.getElementById('sofr-index');
    try {
        const resp = await fetch(SOFR_URL);
        const data = await resp.json();
        const val = parseFloat(data.observations[0].value);
        sofrIndex = Math.round(val * 100000) / 100000; // 5 decimal places
        if (el) el.textContent = sofrIndex.toFixed(5);
    } catch (err) {
        if (el) el.textContent = 'N/A';
        console.error('Error fetching SOFR data:', err);
    }
}

function parseArmCSV(text) {
    // Remove BOM if present and split into lines
    const lines = text.replace(/\ufeff/g, '').trim().split(/\r?\n/);
    const dataLines = lines.slice(1); // skip header
    const arms = [];
    const seen = new Set();

    dataLines.forEach(line => {
        if (!line.trim()) return;
        const cleaned = line.replace(/"""/g, '').replace(/"/g, '').trim();
        const parts = cleaned.split(',');
        if (parts.length < 8) return;
        let code = parts[0].replace('.', '/');
        if (code.toLowerCase().includes('l')) return; // omit 3.6L
        if (seen.has(code)) return;
        const arm = {
            arm_plancode: code,
            initial_period: parts[1],
            subsequent_period: parts[2],
            lifetime_cap: parts[3],
            initial_cap: parts[4],
            subsequent_cap: parts[5],
            margin: parts[6],
            index: parts[7]
        };
        arms.push(arm);
        seen.add(code);
    });
    return arms;
}

function populateSelect(arms) {
    const select = document.getElementById('arm-select');
    if (!select) return;
    select.innerHTML = '<option value="">-- Choose an ARM --</option>';
    arms.forEach(arm => {
        const opt = document.createElement('option');
        opt.value = arm.arm_plancode;
        opt.textContent = `${arm.arm_plancode} ARM`;
        select.appendChild(opt);
    });
    select.addEventListener('change', () => showDetails(select.value, arms));
}

function showDetails(code, arms) {
    const container = document.getElementById('arm-info');
    if (!container) return;
    if (!code) {
        container.style.display = 'none';
        return;
    }
    const arm = arms.find(a => a.arm_plancode === code);
    if (!arm) return;

    currentArm = arm;

    document.getElementById('arm-name').textContent = `${code} ARM`;
    document.getElementById('arm-initial-period').textContent = `${arm.initial_period} months`;
    document.getElementById('arm-subsequent-period').textContent = `${arm.subsequent_period} months`;
    document.getElementById('arm-initial-cap').textContent = arm.initial_cap;
    document.getElementById('arm-subsequent-cap').textContent = arm.subsequent_cap;
    document.getElementById('arm-lifetime-cap').textContent = arm.lifetime_cap;
    document.getElementById('arm-margin').textContent = arm.margin;
    document.getElementById('arm-index').textContent = arm.index;

    const initMonths = parseInt(arm.initial_period, 10);
    const initYears = (initMonths % 12 === 0) ? `${initMonths / 12} year${initMonths/12>1?'s':''}` : `${initMonths} months`;
    const explanationPart1 = `The ${code} ARM starts with a fixed rate for ${initYears} before adjusting every ${arm.subsequent_period} months.`;
    const explanation = explanationPart1 +
        ` The first adjustment is limited to ${arm.initial_cap} and later adjustments to ${arm.subsequent_cap}, with a lifetime cap of ${arm.lifetime_cap}.` +
        ` Rates are based on the ${arm.index} plus a margin of ${arm.margin}.`;
    document.getElementById('arm-explanation').textContent = explanation;

    container.style.display = 'block';
}

function simulateRate() {
    if (!currentArm) {
        alert('Please select an ARM product.');
        return;
    }
    if (sofrIndex === null) {
        alert('SOFR index not available.');
        return;
    }
    const rateInput = document.getElementById('current-rate');
    const currentRate = parseFloat(rateInput.value);
    if (isNaN(currentRate)) {
        alert('Please enter your current interest rate.');
        return;
    }
    const margin = parseFloat(currentArm.margin);
    const newRate = roundToEighth(sofrIndex + margin);
    const resultDiv = document.getElementById('simulation-result');
    resultDiv.innerHTML = `At your next change date, the rate will be based on the index (${sofrIndex.toFixed(5)}%) plus the margin (${margin}%), rounded to the nearest 1/8%.<br><strong>New rate:</strong> ${newRate.toFixed(3)}% (current rate: ${currentRate.toFixed(3)}%)`;
    resultDiv.style.display = 'block';
}

function roundToEighth(rate) {
    return Math.round(rate * 8) / 8;
}

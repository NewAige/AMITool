// Script for Adjustable-Rate Mortgage learning page

document.addEventListener('DOMContentLoaded', () => {
    fetch('armtable.csv')
        .then(response => response.text())
        .then(text => {
            const arms = parseArmCSV(text);
            populateSelect(arms);
            populateTable(arms);
        })
        .catch(err => console.error('Error loading ARM data:', err));
});

function parseArmCSV(text) {
    // Remove BOM if present and split into lines
    const lines = text.replace(/\ufeff/g, '').trim().split(/\r?\n/);
    const dataLines = lines.slice(1); // skip header
    const arms = [];
    const seen = new Set();

    dataLines.forEach(line => {
        if (!line.trim()) return;
        // remove all quotes created by Excel triple quoting
        const cleaned = line.replace(/"""/g, '').replace(/"/g, '').trim();
        const parts = cleaned.split(',');
        if (parts.length < 8) return;
        const arm = {
            arm_plancode: parts[0],
            initial_period: parts[1],
            subsequent_period: parts[2],
            lifetime_cap: parts[3],
            initial_cap: parts[4],
            subsequent_cap: parts[5],
            margin: parts[6],
            index: parts[7]
        };
        if (!seen.has(arm.arm_plancode)) {
            arms.push(arm);
            seen.add(arm.arm_plancode);
        }
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

function populateTable(arms) {
    const tbody = document.querySelector('#arm-table tbody');
    if (!tbody) return;
    arms.forEach(arm => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${arm.arm_plancode}</td>
            <td>${arm.initial_period}</td>
            <td>${arm.subsequent_period}</td>
            <td>${arm.initial_cap}</td>
            <td>${arm.subsequent_cap}</td>
            <td>${arm.lifetime_cap}</td>
            <td>${arm.margin}</td>
            <td>${arm.index}</td>`;
        tbody.appendChild(tr);
    });
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

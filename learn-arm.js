// Script for Adjustable-Rate Mortgage learning page

let currentArm = null;

document.addEventListener('DOMContentLoaded', () => {
    fetch('armtable.csv')
        .then(response => response.text())
        .then(text => {
            const arms = parseArmCSV(text);
            populateSelect(arms);
        })
        .catch(err => console.error('Error loading ARM data:', err));

    const btn = document.getElementById('simulate-btn');
    if (btn) btn.addEventListener('click', simulateRate);
});

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

    // Define the desired order
    const desiredOrder = ['3/6', '5/6', '7/6', '10/6'];

    // Sort the arms array according to the desired order
    arms.sort((a, b) => {
        const indexA = desiredOrder.indexOf(a.arm_plancode);
        const indexB = desiredOrder.indexOf(b.arm_plancode);
        // If an item is not in the desired order, push it to the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

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

    const sofrInput = document.getElementById('sofr-index');
    const sofrIndex = parseFloat(sofrInput.value);
    if (isNaN(sofrIndex)) {
        alert('Please enter a valid SOFR index.');
        return;
    }

    const rateInput = document.getElementById('current-rate');
    const currentRate = parseFloat(rateInput.value);
    if (isNaN(currentRate)) {
        alert('Please enter your current interest rate.');
        return;
    }

    const margin = parseFloat(currentArm.margin);
    const initialCap = parseFloat(currentArm.initial_cap);
    const subCap = parseFloat(currentArm.subsequent_cap);
    const lifeCap = parseFloat(currentArm.lifetime_cap);

    const fullyIndexedRate = roundToEighth(sofrIndex + margin);

    // First adjustment
    const firstAdjMax = roundToEighth(currentRate + initialCap);
    const firstAdjMin = roundToEighth(currentRate - initialCap);
    let firstAdjRate = fullyIndexedRate;
    if (firstAdjRate > firstAdjMax) firstAdjRate = firstAdjMax;
    if (firstAdjRate < firstAdjMin) firstAdjRate = firstAdjMin;

    // Subsequent adjustment
    const subAdjMax = roundToEighth(firstAdjRate + subCap);
    const subAdjMin = roundToEighth(firstAdjRate - subCap);
    let subAdjRate = fullyIndexedRate;
    if(subAdjRate > subAdjMax) subAdjRate = subAdjMax;
    if(subAdjRate < subAdjMin) subAdjRate = subAdjMin;

    // Lifetime cap
    const lifetimeMax = roundToEighth(currentRate + lifeCap);
    if (firstAdjRate > lifetimeMax) firstAdjRate = lifetimeMax;
    if (subAdjRate > lifetimeMax) subAdjRate = lifetimeMax;

    const resultDiv = document.getElementById('simulation-result');
    resultDiv.innerHTML = `
        <div class="result-card">
            <h4>Fully Indexed Rate</h4>
            <p class="rate">${fullyIndexedRate.toFixed(3)}%</p>
            <p class="rate-context">SOFR ${sofrIndex.toFixed(4)}% + Margin ${margin}%</p>
            <p>This is the rate based on the index and margin, before caps.</p>
        </div>
        <div class="result-card">
            <h4>Potential First Adjustment</h4>
            <p class="rate">${firstAdjRate.toFixed(3)}%</p>
            <p>Your rate is limited by the <strong>${initialCap}% initial cap</strong>.</p>
        </div>
        <div class="result-card">
            <h4>Potential Subsequent Adjustment</h4>
            <p class="rate">${subAdjRate.toFixed(3)}%</p>
            <p>Further changes are limited by the <strong>${subCap}% subsequent cap</strong>.</p>
        </div>
        <div class="result-card">
            <h4>Lifetime Maximum Rate</h4>
            <p class="rate">${lifetimeMax.toFixed(3)}%</p>
            <p>Your rate will never exceed this, due to the <strong>${lifeCap}% lifetime cap</strong>.</p>
        </div>
    `;
    resultDiv.style.display = 'block';
}

function roundToEighth(rate) {
    return Math.round(rate * 8) / 8;
}

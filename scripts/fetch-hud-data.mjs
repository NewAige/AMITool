#!/usr/bin/env node
// Downloads HUD town lists and income limits for MA and RI into data/hud/
// so the static site never has to call the HUD API from the browser
// (HUD's API does not send CORS headers, so browser calls are blocked).
//
// Usage: HUD_API_TOKEN=... node scripts/fetch-hud-data.mjs [year ...]
// With no years given, fetches the current and previous calendar year.
// A year HUD has not published yet is skipped.

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const API = 'https://www.huduser.gov/hudapi/public';
const STATES = ['MA', 'RI'];
const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'data', 'hud');
const DELAY_MS = 150;

const token = process.env.HUD_API_TOKEN;
if (!token) {
    console.error('HUD_API_TOKEN is not set.');
    process.exit(1);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getJson(url) {
    for (let attempt = 1; attempt <= 5; attempt++) {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) return res.json();
        if (res.status === 404) return null;
        if (res.status === 429 || res.status >= 500) {
            const wait = 2000 * attempt;
            console.warn(`  ${res.status} for ${url}, retrying in ${wait}ms`);
            await sleep(wait);
            continue;
        }
        throw new Error(`HTTP ${res.status} for ${url}: ${await res.text()}`);
    }
    throw new Error(`Giving up on ${url}`);
}

async function writeJson(file, data) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(data, null, 1) + '\n');
}

async function main() {
    const thisYear = new Date().getUTCFullYear();
    const years = process.argv.slice(2).length
        ? process.argv.slice(2).map(Number)
        : [thisYear, thisYear - 1];

    const towns = {};
    for (const state of STATES) {
        const list = await getJson(`${API}/fmr/listCounties/${state}`);
        if (!Array.isArray(list) || list.length === 0) {
            throw new Error(`Unexpected town list for ${state}: ${JSON.stringify(list)}`);
        }
        towns[state] = list;
        await writeJson(path.join(OUT, 'towns', `${state}.json`), list);
        console.log(`${state}: ${list.length} towns`);
    }

    let manifest = { years: [] };
    try {
        manifest = JSON.parse(await readFile(path.join(OUT, 'manifest.json'), 'utf8'));
    } catch { /* first run */ }
    const available = new Set(manifest.years || []);

    for (const year of years) {
        // Probe with the first town; skip years HUD has not published yet.
        const probe = towns.MA[0].fips_code;
        const probeRes = await getJson(`${API}/il/data/${probe}?year=${year}`);
        if (!probeRes || !probeRes.data || String(probeRes.data.year) !== String(year)) {
            console.log(`${year}: not published yet, skipping`);
            continue;
        }

        let count = 0;
        for (const state of STATES) {
            for (const town of towns[state]) {
                const res = town.fips_code === probe
                    ? probeRes
                    : await getJson(`${API}/il/data/${town.fips_code}?year=${year}`);
                if (!res || !res.data) {
                    console.warn(`  ${year} ${state} ${town.town_name} (${town.fips_code}): no data`);
                } else {
                    await writeJson(path.join(OUT, 'il', String(year), `${town.fips_code}.json`), res);
                    count++;
                }
                await sleep(DELAY_MS);
            }
        }
        console.log(`${year}: saved income limits for ${count} towns`);
        if (count > 0) available.add(year);
    }

    manifest = {
        years: [...available].sort((a, b) => b - a),
        source: 'HUD User API (www.huduser.gov/hudapi)'
    };
    await writeJson(path.join(OUT, 'manifest.json'), manifest);
    console.log('Available years:', manifest.years.join(', ') || 'none');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

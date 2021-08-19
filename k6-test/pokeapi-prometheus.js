import http from 'k6/http';
import { sleep, check } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from "k6/data";

export const options = {
    scenarios: {
        pokeapi: {
            executor: 'ramping-vus',
            exec: 'catchEmAll',
            startVUs: 0,
            stages: [
                { duration: '15m', target: 2 },
                { duration: '45m', target: 40 },
            ],
            gracefulRampDown: '60s',
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.05'],
    },
    ext: {
        loadimpact: {
          apm: [
            {
              provider: "prometheus",
              remoteWriteURL: "",
              credentials: {
                token: ""
              },
              metrics: ["http_req_duration", "http_req_failed"],
              includeDefaultMetrics: true,
              includeTestRunId: false
            },
          ]
        },
      },
};

const domain = 'http://cluster.nicolevanderhoeven.com/api/v2';
const sharedData = new SharedArray("Shared Logins", function() {
    let data = papaparse.parse(open('pokemon.csv'), { header: true }).data;
    return data;
});

export function catchEmAll() {
    GetPokemon();
    ThinkTime();
}

export function GetPokemon() {
    // Get random mon from shared array
    let randomMon = sharedData[Math.floor(Math.random() * sharedData.length)];
    // console.log(JSON.stringify(randomMon) + ' selected');

    let res = http.get(domain + '/pokemon/' + randomMon.name, {tags: { name: '01_GetPokemon' }});
    check(res, {
        'is status 200': (r) => r.status === 200,
        '01-text verification': (r) => r.body.includes(randomMon.name)
    });
    sleep(Math.random() * 5);
}

export function ThinkTime() {
    sleep(Math.random() * 5);
}
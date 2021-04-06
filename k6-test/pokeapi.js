import http from 'k6/http';
import { sleep, check } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from "k6/data";
import { NewRel } from './util/newrelic.js';

const apiKey = '';
const nr = new NewRel(apiKey);

export const options = {
    duration: '3m',
    vus: 50,
    thresholds: {
        http_req_failed: ['rate<0.05'],
    },
};

const domain = 'http://cluster.nicolevanderhoeven.com/api/v2';
const sharedData = new SharedArray("Shared Logins", function() {
    let data = papaparse.parse(open('pokemon.csv'), { header: true }).data;
    return data;
});

export function setup() {
    nr.PrintAlertingStatus();
    nr.PrintServerHealth();
}

export default function () {
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

export function teardown(data) {
    nr.PrintAlertingStatus();
    nr.PrintServerHealth();
}
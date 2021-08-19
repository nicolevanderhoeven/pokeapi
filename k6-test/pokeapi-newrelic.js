import http from 'k6/http';
import { sleep, check } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from "k6/data";
import { NewRel } from './util/newrelic.js';
import { Pods } from 'k6/x/chaos/k8s';

const apiKey = '';
const nr = new NewRel(apiKey);

export const options = {
    scenarios: {
        pokeapi: {
            executor: 'ramping-vus',
            exec: 'catchEmAll',
            startVUs: 0,
            stages: [
                { duration: '15m', target: 40 },
                { duration: '45m', target: 40 },
            ],
            gracefulRampDown: '60s',
        },
        // chaos: {
        //     executor: 'per-vu-iterations',
        //     exec: 'killPod',
        //     vus: 1,
        //     iterations: 1,
        //     startTime: '30m',
        // },
    },
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

export function teardown(data) {
    nr.PrintAlertingStatus();
    nr.PrintServerHealth();
}

export function killPod() {
    const pod = new Pods();
    // console.log(`There are currently ${pod.list().length} pods.`);
    let victim = 'not chosen';
    // Iterate through the list of pods to determine which one to kill.
    for (let i = 0; i < pod.list().length; i++) {
        victim = pod.list()[i];
        console.log('in loop', i, ': victim:', victim);
        // Choose a pod with a name starting with a substring to kill.
        if (victim.startsWith('web')) {
            console.log('Victim chosen:', victim);
            break;
        }
    }

    // Kill chosen pod.
    console.log(`Killing pod ${victim}.`);
    pod.killByName('default', victim);
    console.log(`There are currently ${pod.list().length} pods after killing ${victim}.`);
}
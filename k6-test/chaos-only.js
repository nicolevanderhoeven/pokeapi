import http from 'k6/http';
import { sleep, check } from 'k6';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import { SharedArray } from "k6/data";
import { NewRel } from './util/newrelic.js';
import chaos from 'k6/x/chaos';
import { Pods } from 'k6/x/chaos/k8s';

const apiKey = '';
const nr = new NewRel(apiKey);

export const options = {
    scenarios: {
        // pokeapi: {
        //     executor: 'constant-vus',
        //     exec: 'catchEmAll',
        //     vus: 40,
        //     duration: '60m',
        // },
        chaos: {
            executor: 'per-vu-iterations',
            exec: 'killPod',
            vus: 1,
            iterations: 1,
            // startTime: '30m',
            // maxDuration: '5m',
        },
    },
    thresholds: {
        http_req_failed: ['rate<0.05'],
    },
};

export function killPod() {
    const pod = new Pods();
    console.log(`There are currently ${pod.list().length} pods.`);
    let victim = 'not chosen';
    // Iterate through the list of pods to determine which one to kill.
    for (let i = 0; i < pod.list().length; i++) {
        victim = pod.list()[i];
        console.log('in loop', i, ': victim:', victim);
        // Choose a pod with a name starting with a substring to kill.
        if (victim.startsWith('app')) {
            console.log('Victim chosen:', victim);
            break;
        }
    }

    // Kill chosen pod.
    console.log(`Killing pod ${victim}.`);
    pod.killByName('default', victim);
    console.log(`There are currently ${pod.list().length} pods after killing ${victim}.`);
}
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
    scenarios: {
        pokeapi: {
            executor: 'ramping-vus',
            exec: 'catchEmAll',
            startVUs: 0,
            stages: [
                { duration: '3m', target: 10 },
                // { duration: '45m', target: 10 },
            ],
            gracefulRampDown: '60s',
        },
    },
    thresholds: {
        http_req_failed: ['rate<=0.05'],
        http_req_duration: ["p(50)<=5000"],
    },
};

export function catchEmAll() {
    GetPokemon();
    ThinkTime();
}

export function GetPokemon() {

    let res = http.get(domain + '/pokemon/pikachu', {tags: { name: '01_GetPokemon' }});
    check(res, {
        'is status 200': (r) => r.status === 200,
        '01-text verification': (r) => r.body.includes('pikachu')
    });
}

export function ThinkTime() {
    sleep(Math.random() * 5);
}
import http from 'k6/http';
import { sleep, check } from 'k6';

export default function catchEmAll() {
    let res = http.get('http://cluster.nicolevanderhoeven.com/api/v2/pokemon/pikachu');
    check(res, {
        'is status 200': (r) => r.status === 200,
        '01-text verification': (r) => r.body.includes("pikachu")
    });
    sleep(Math.random() * 5);
}
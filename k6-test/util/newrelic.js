import http from 'k6/http';

export class NewRel {
  constructor(apiKey, log = false) {
    this.log = log;
    this.params = {
      headers: {
        'Content-Type': 'application/json',
        'API-Key': apiKey,
      },
    };
    this.urls = {
      graphql: 'https://api.newrelic.com/graphql',
    };
  }

  PrintAlertingStatus() {
    let payload = JSON.stringify({
      query: `
      {
        actor {
          entitySearch(query: "name LIKE 'pokeapi%'") {
            results {
              entities {
                ... on AlertableEntityOutline {
                  alertSeverity
                }
              }
            }
          }
        }
      }
      `,
    });

    let res = http.post(this.urls.graphql, payload, this.params);

    if (this.log) {
      console.log('New Relic Check HTTP Status is: ' + res.status);
    }

    if (res.status === 200) {
      let body = JSON.parse(res.body);
      var result = body.data.actor.entitySearch.results.entities[0].alertSeverity;
      console.log('New Relic Status: ' + result);
    }
  }

  PrintServerHealth() {
    
    // From NerdGraph, copy the GraphQL payload from tools > copy as cURL > take the entire {"query"} section
    let payload = JSON.stringify({
      query: `
      {
        actor {
          entitySearch(query: "name LIKE 'pokeapi%'") {
            results {
              entities {
                ... on InfrastructureHostEntityOutline {
                  name
                  hostSummary {
                    cpuUtilizationPercent
                    diskUsedPercent
                    memoryUsedPercent
                    networkReceiveRate
                    networkTransmitRate
                    servicesCount
                  }
                  permalink
                }
              }
            }
          }
        }
      } 
    `
    });

    let res = http.post(this.urls.graphql, payload, this.params);
    // Check we are not experiencing HTTP 400. If you are, the payload is likely wrong.

    if (this.log) {
      for (i=0; i < 2; i++) { 
        console.log('Node ' + i + ' - CPU Utilization' + JSON.stringify(res.body.data.actor.entitySearch.results.entities[i].hostSummary.cpuUtilizationPercent));
        console.log('Node ' + i + ' - Disk Utilization' + JSON.stringify(res.body.data.actor.entitySearch.results.entities[i].hostSummary.diskUsedPercent));
        console.log('Node ' + i + ' - Memory Utilization' + JSON.stringify(res.body.data.actor.entitySearch.results.entities[i].hostSummary.memoryUsedPercent));
        console.log('Node ' + i + ' - Network Receive Rate' + JSON.stringify(res.body.data.actor.entitySearch.results.entities[i].hostSummary.networkReceiveRate));
        console.log('Node ' + i + ' - Network Transmit Rate' + JSON.stringify(res.body.data.actor.entitySearch.results.entities[i].hostSummary.networkTransmitRate));
        console.log('Node ' + i + ' - Services Count' + JSON.stringify(res.body.data.actor.entitySearch.results.entities[i].hostSummary.servicesCount));
        console.log('Node ' + i + ' - Permalink' + JSON.stringify(res.body.data.actor.entitySearch.results.entities[i].permalink));
      }
    }

    if (res.status === 200) {
      let body = JSON.parse(res.body);
      var result = body.data.actor.entitySearch.results
      console.log('Server Health: ' + JSON.stringify(result));
      
    } else {
      throw new Error('Could not fetch ServerHealth from New Relic')
    }

    return result;
  }

  //Send a deployment marker with start/end information on load test.
//   Notify(testName, state, description, user) {
//     var url =
//       'https://api.newrelic.com/v2/applications/' + this.AppID() + '/deployments.json';
//     console.log(url);

//     // From NerdGraph, copy the GraphQL payload from tools > copy as cURL > take the entire {"query"} section
//     let payload = JSON.stringify({
//       deployment: {
//         revision: testName,
//         changelog: 'k6 load test ' + state,
//         description: description,
//         user: user,
//       },
//     });

//     let res = http.post(url, payload, this.params);
//     // Check we are not experiencing HTTP 400. If you are, the payload is likely wrong.
//     if (![200, 201].includes(res.status)) {
//       throw new Error(`Could not notify New Relic about test state (res: ${res.status})`)
//     }
    
//     return JSON.stringify(res.status);
//   }
}
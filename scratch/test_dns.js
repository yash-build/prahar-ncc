const dns = require('dns');
dns.resolveSrv('_mongodb._tcp.shashtra-cluster.3cswaqq.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Addresses:', addresses);
  }
});

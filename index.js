// question one   
   
// const fs = require('fs');

// const filePath = './big.txt';

// const readableStream = fs.createReadStream(filePath, {
//   encoding: 'utf8',
//   highWaterMark: 64
// });

// readableStream.on('data', (chunk) => {
//   console.log('--- New Chunk ---');
//   console.log(chunk);
// });

// readableStream.on('end', () => {
//   console.log('File reading completed.');
// });

// readableStream.on('error', (error) => {
//   console.error('Error:', error.message);
// });


// question two

// const fs = require('fs');

// const source = './big.txt';
// const destination = './dest.txt';

// const readableStream = fs.createReadStream(source);
// const writableStream = fs.createWriteStream(destination);

// readableStream.on('data', (chunk) => {
//   writableStream.write(chunk);
// });

// readableStream.on('end', () => {
//   writableStream.end();
//   console.log('File copied using streams');
// });

// readableStream.on('error', (err) => {
//   console.error(err);
// });

// writableStream.on('error', (err) => {
//   console.error(err);
// });




// question three 

// const fs = require('fs');
// const zlib = require('zlib');
// const { pipeline } = require('stream');

// const sourceFile = './big.txt';
// const compressedFile = './data.txt.gz';

// pipeline(
//   fs.createReadStream(sourceFile),   
//   zlib.createGzip(),                  
//   fs.createWriteStream(compressedFile), 
//   (err) => {
//     if (err) {
//       console.error('Pipeline failed:', err);
//     } else {
//       console.log('File compressed successfully using pipeline');
//     }
//   }
// );


// part 2

const http = require('http');
const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, 'users.json');

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // ======================
  // Question 1: ADD USER
  // ======================
  if (method === 'POST' && url === '/user') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const newUser = JSON.parse(body);

      fs.readFile(usersFile, 'utf8', (err, data) => {
        if (err) return;

        const users = JSON.parse(data);

        const emailExists = users.find(
          user => user.email === newUser.email
        );

        if (emailExists) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(
            JSON.stringify({ message: 'Email already exists.' })
          );
        }

        newUser.id = Date.now();
        users.push(newUser);

        fs.writeFile(usersFile, JSON.stringify(users, null, 2), () => {
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({ message: 'User added successfully.' })
          );
        });
      });
    });
  

  }



  
  // ======================
  // Question 2: UPDATE USER
  // ======================
  else if (method === 'PATCH' && url.startsWith('/user/')) {
    const id = parseInt(url.split('/')[2]);
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const updates = JSON.parse(body);

      fs.readFile(usersFile, 'utf8', (err, data) => {
        if (err) return;

        const users = JSON.parse(data);
        const userIndex = users.findIndex(user => user.id === id);

        if (userIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(
            JSON.stringify({ message: 'User ID not found.' })
          );
        }

        users[userIndex] = {
          ...users[userIndex],
          ...updates
        };

        fs.writeFile(usersFile, JSON.stringify(users, null, 2), () => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({ message: 'User updated successfully.' })
          );
        });
      });
    });
  }

  // DELETE /user/:id
  // ======================
  else if (method === 'DELETE' && url.startsWith('/user/')) {
    const id = Number(url.split('/')[2]);

    readUsers(users => {
      const index = users.findIndex(u => u.id === id);
      if (index === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'User ID not found.' }));
      }

      users.splice(index, 1);

      writeUsers(users, () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User deleted successfully.' }));
      });
    });
  }



   // GET /user
  // ======================
  else if (method === 'GET' && url === '/user') {
    readUsers(users => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users));
    });
  }

   // GET /user/:id
  // ======================
  else if (method === 'GET' && url.startsWith('/user/')) {
    const id = Number(url.split('/')[2]);

    readUsers(users => {
      const user = users.find(u => u.id === id);
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'User not found.' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user));
    });
  }
})

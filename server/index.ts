import { isTest, createServer } from './server';

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(3000, () => {
      console.log('http://localhost:3000');
    })
  );
}

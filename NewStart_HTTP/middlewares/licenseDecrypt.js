module.exports = function (req, res, next) {
   try {
      // const data = [
      //    { key: 'params', text: req.params?.license },
      //    { key: 'body', text: req.body?.license },
      //    { key: 'query', text: req.query?.license }

      // ].find(obj => obj.text);

      // const key = Buffer.from('64152c67551417887518f1ea1c09986c857f2d13ca0989b07de0c6068fc20fc5', 'hex');
      // const iv = Buffer.from('e131389bad329a652651465c9fd8c0bf', 'hex');;
      // const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

      // let decrypted = decipher.update(data.text, 'hex', 'utf-8');

      // if (decrypted) {
      //    decrypted += decipher.final("utf8");
      //    req[data.key].license = decrypted;
      // }
      
      next();

   } catch(err) {
      console.log(err)
      res.status(403).send('Wrong license...');
   }
}
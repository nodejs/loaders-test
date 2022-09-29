import pgp from 'openpgp';
import assert from 'assert';
import { promises as fs } from 'fs';
const passwd = process.env.npm_package_config_key_passwd;
var pubKey, publicKeys, privKey, privateKeys, moduleSrc;

pgp.generateKey({
    userIds: [{ name: 'Ace Ventura', email: 'ace@detective.pet' }],
    curve: 'ed25519',
    passphrase: passwd
})

.then(({ privateKeyArmored, publicKeyArmored }) => {
    privKey = privateKeyArmored;
    pubKey = publicKeyArmored;
    console.log(privKey +'═════════════════════════════════════════\n'+ pubKey);
    return Promise.all([
        fs.writeFile('private-key.asc', privKey.replace(/\r/g, '')),
        fs.writeFile('public-key.asc', pubKey.replace(/\r/g, ''))
    ]);
})

.then(() => fs.readFile('fixture.js', 'utf8'))
.then(src => moduleSrc = src)

.then(() => pgp.key.readArmored(pubKey))
.then(pub => publicKeys = pub.keys)

.then(() => pgp.key.readArmored(privKey))
.then(priv => privateKeys = priv.keys)
.then(() => privateKeys[0].decrypt(passwd))

.then(() => pgp.encrypt({
    message: pgp.message.fromText(moduleSrc),
    publicKeys: publicKeys,
    privateKeys: privateKeys
}))
.then(cipher => {
    console.log('Encrypted module:\n', cipher.data);
    return fs.writeFile('fixture.js.pgp', cipher.data.replace(/\r/g, ''));
})

// Test it:

.then(() => fs.readFile('fixture.js.pgp', 'utf8'))
.then(encrypted => pgp.message.readArmored(encrypted))
.then(cryptMsg => pgp.decrypt({
    message: cryptMsg,
    publicKeys: publicKeys,
    privateKeys: privateKeys
}))

.then(decrypted => assert.equal(decrypted.data, moduleSrc))

.then(() => console.log('All fine!'))

.catch(err => {
    console.error('>>> Encryption fail! <<<\n', err);
    process.exit(1);
})

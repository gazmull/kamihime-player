const express = require('express');
const fs = require('fs');
const { promisify } = require('util');

const characters = require(`${__dirname}/static/scenarios/config.json`);

const app = express();
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

const findCharacter = id => {
  const { eidolon, r, soul, sr, ssr, ssra } = characters;
  const all = eidolon.concat(r, soul, sr, ssr, ssra);
  const character = all.filter(i => i.name === id);

  if (!character.length)
    return null;

  return character.shift();
};

const findScript = async (id, res) => JSON.parse(await readFile(`${__dirname}/static/scenarios/${id}/${res}/script.json`));

app
  .set('view engine', 'pug')
  .set('views', `${__dirname}/views`)
  .use(express.static(`${__dirname}/static`))
  .get('/', (_, res) => res.render('browser', { characters }))
  .get('/info/:id', async (req, res) => {
    const { id = 'nein' } = req.params;
    const { image = false } = req.query;
    const character = findCharacter(id);

    if (!character || !character.harem1.resource) return res.render('invalids/422');
    if (image) {
      const img = fs.createReadStream(`${__dirname}/static/scenarios/0000/misc/${character.model}`);

      img.on('error', err => console.log(err));
      res.setHeader('Content-Type', 'image/png');

      return img.pipe(res);
    }

    const script = await findScript(id, character.harem1.resource);
    const cleanID = id.replace(/([([].+[)\]])/, ' ').trim();

    res.render('info', { character, model: script.model[cleanID] });
  })
  .get('/player/:id/:type/:resource', async (req, res) => {
    const { id, type, resource } = req.params;

    try {
      const template = type === 'story'
        ? 'player/story'
        : type === 'scenario'
          ? 'player/scenario'
          : type === 'legacy'
            ? 'player/legacy'
            : null;
      const character = findCharacter(id);
      const script = await findScript(id, resource);

      if (!(template || character || script)) return res.render('invalids/422');

      const data = {
        files: await readdir(`${__dirname}/static/scenarios/${id}/${resource}/`),
        script: script.scenario,
        res: `/scenarios/${id}/${resource}`
      };

      if (type === 'story')
        Object.assign(data, { msc: '/scenarios/0000/misc/' });

      res.render(template, data);
    } catch (err) {
      res.render('invalids/500');

      console.log(err);
    }
  })
  .all('*', (_, res) => res.render('invalids/404'))
  .listen(80);

console.log('Listening to http://localhost');

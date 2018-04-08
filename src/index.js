const express = require('express');
const fs = require('fs');
const { promisify } = require('util');

const characters = require('./static/scenarios/config.json');

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

app
  .set('view engine', 'pug')
  .set('views', './src/views')
  .use(express.static('./src/static'))
  .get('/', (_, res) => res.render('browser', { characters }))
  .get('/info/:id', (req, res) => {
    const { id = 'nein' } = req.params;
    const character = findCharacter(id);

    if (!character) return res.render('invalids/422');

    res.render('info', { character });
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
      const script = JSON.parse(await readFile(`./src/static/scenarios/${id}/${resource}/script.json`));

      if (!(template || character || script)) return res.render('invalids/422');

      const data = {
        files: await readdir(`./src/static/scenarios/${id}/${resource}/`),
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

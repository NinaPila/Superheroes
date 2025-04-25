const { Router } = require('express');
const fs = require('fs');
const path = require('path');
const router = Router();

const dataPath = path.join(__dirname, 'datos.json');
let datos = require(dataPath);
const guardarDatos = () => {
    fs.writeFileSync(dataPath, JSON.stringify(datos, null, 2));
};

// Rutas GET
router.get('/superheroes', (req, res) => res.json(datos.Organizacion.Superheroes)); //Todos los superheroes
router.get('/supervillians', (req, res) => res.json(datos.Organizacion.SuperVillians)); //Todos los supervillanos
router.get('/organizacion', (req, res) => { //Datos de la organizacion
    const { Name, Ubication, "Inauguration Date": inaugurationDate, Owner, Status } = datos.Organizacion;
    res.json({ Name, Ubication, "Inauguration Date": inaugurationDate, Owner, Status });
});

const getCharacterByName = (array, name) => array.find(c => c.Name.toLowerCase() === name.toLowerCase());

router.get('/superheroes/:name', (req, res) => {    //Buscar superheroe y sus datos por nombre
    const hero = getCharacterByName(datos.Organizacion.Superheroes, req.params.name);
    hero ? res.json(hero) : res.status(404).json({ error: "Superhéroe no encontrado" });
});

router.get('/supervillians/:name', (req, res) => {      //Buscar supervillano y sus datos por nombre
    const villain = getCharacterByName(datos.Organizacion.SuperVillians, req.params.name);
    villain ? res.json(villain) : res.status(404).json({ error: "Supervillano no encontrado" });
});

//Manda nemesis, comida, poderes y fun fact de superheroe por su nombre
['Nemesis', 'Favorite food', 'Powers', 'Fun fact', 'Base of Operations'].forEach(attr => {    
    router.get(`/superheroes/:name/${attr.toLowerCase().replace(/ /g, '')}`, (req, res) => {
        const hero = getCharacterByName(datos.Organizacion.Superheroes, req.params.name);
        hero && hero[attr] ? res.json({ [attr]: hero[attr] }) : res.status(404).json({ error: "Dato no encontrado" });
    });
    //Lo mismo pero para los supervillanos
    router.get(`/supervillians/:name/${attr.toLowerCase().replace(/ /g, '')}`, (req, res) => {
        const villain = getCharacterByName(datos.Organizacion.SuperVillians, req.params.name);
        villain && villain[attr] ? res.json({ [attr]: villain[attr] }) : res.status(404).json({ error: "Dato no encontrado" });
    });
});

// Ruta para obtener la identidad secreta de un superhéroe
router.get('/superheroes/secretidentity/:name', (req, res) => {
    const hero = datos.Organizacion.Superheroes.find(h => 
        h["Name"].toLowerCase().trim() === req.params.name.toLowerCase().trim()
    );

    if (!hero) {
        return res.status(404).json({ error: "Superhéroe no encontrado con esa identidad secreta" });
    }

    const { Age, "Secret Identity": secretidentity, "Place of Origin": placeoforigin, "Favorite food": favoritefood } = hero;
    res.json({ Age, "Secret Identity": secretidentity, "Place of Origin": placeoforigin, "Favorite food": favoritefood });
});

// Ruta para obtener la identidad secreta de un supervillano
router.get('/supervillians/secretidentity/:name', (req, res) => {
    const villain = datos.Organizacion.SuperVillians.find(v => 
        v["Name"].toLowerCase().trim() === req.params.name.toLowerCase().trim()
    );

    if (!villain) {
        return res.status(404).json({ error: "Supervillano no encontrado con esa identidad secreta" });
    }

    const { Age, "Secret Identity": secretidentity, "Place of Origin": placeoforigin, "Favorite food": favoritefood } = villain;
    res.json({ Age, "Secret Identity": secretidentity, "Place of Origin": placeoforigin, "Favorite food": favoritefood });
});




// Rutas POST
router.post('/NEWsuperheroe', (req, res) => {   //Nuevo superheroe
    datos.Organizacion.Superheroes.push(req.body);
    guardarDatos();
    res.status(201).json(req.body);
});

router.post('/NEWsupervillian', (req, res) => {     //Nuevo supervillano
    datos.Organizacion.SuperVillians.push(req.body);
    guardarDatos();
    res.status(201).json(req.body);
});

// Te permite agregar poderes a los superheroes
router.post(`/superheroes/:name/powers`, (req, res) => {
    const hero = getCharacterByName(datos.Organizacion.Superheroes, req.params.name);
    if (!hero) return res.status(404).json({ error: "Superhéroe no encontrado" });

    // Convertimos a array si aún es string
    hero['Powers'] = hero['Powers'] ? hero['Powers'].split(', ') : [];

    // Agregamos el nuevo poder
    hero['Powers'].push(req.body.Power);

    // Convertimos de vuelta a string separado por comas
    hero['Powers'] = hero['Powers'].join(', ');

    guardarDatos();
    res.json({ mensaje: "Poder añadido", hero });
});

// Te permite agregar poderes a los supervillanos
router.post(`/supervillians/:name/powers`, (req, res) => {
    const villain = getCharacterByName(datos.Organizacion.SuperVillians, req.params.name);
    if (!villain) return res.status(404).json({ error: "Supervillano no encontrado" });

    villain['Powers'] = villain['Powers'] ? villain['Powers'].split(', ') : [];
    villain['Powers'].push(req.body.Power);
    villain['Powers'] = villain['Powers'].join(', ');

    guardarDatos();
    res.json({ mensaje: "Poder añadido", villain });
});


// Rutas PUT
//Actualiza nemesis, comida y edad de superheroes
['Nemesis', 'Favorite food', 'Age'].forEach(attr => {
    router.put(`/superheroes/:name/${attr.toLowerCase().replace(/ /g, '')}`, (req, res) => {
        const hero = getCharacterByName(datos.Organizacion.Superheroes, req.params.name);
        if (!hero) return res.status(404).json({ error: "Superhéroe no encontrado" });
        hero[attr] = req.body.Update || hero[attr];
        guardarDatos();
        res.json({ mensaje: "Información actualizada", hero });
    });
//Lo mismo pero para supervillanos
    router.put(`/supervillians/:name/${attr.toLowerCase().replace(/ /g, '')}`, (req, res) => {
        const villain = getCharacterByName(datos.Organizacion.SuperVillians, req.params.name);
        if (!villain) return res.status(404).json({ error: "Supervillano no encontrado" });
        villain[attr] = req.body.Update || villain[attr];
        guardarDatos();
        res.json({ mensaje: "Información actualizada", villain });
    });
});

// Rutas DELETE
router.delete('/superheroes/:name', (req, res) => {
    datos.Organizacion.Superheroes = datos.Organizacion.Superheroes.filter(h => h.Name.toLowerCase() !== req.params.name.toLowerCase());
    guardarDatos();
    res.json({ mensaje: "Superhéroe eliminado" });
});

router.delete('/supervillians/:name', (req, res) => {
    datos.Organizacion.SuperVillians = datos.Organizacion.SuperVillians.filter(v => v.Name.toLowerCase() !== req.params.name.toLowerCase());
    guardarDatos();
    res.json({ mensaje: "Supervillano eliminado" });
});

module.exports = router;

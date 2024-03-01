const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();


// app.use(bodyParser.json());

//Register Menu
module.exports = (db, secretKey) =>{
    router.post('/AddHotDrinks', authenticateToken ,async(req,res) => {

        try {
    
            const {name, description, menu_id} = req.body;
    
            const insertUserQuery = 'INSERT INTO Hot_drinks(name, description, menu_id) VALUES(?,?,?);';
            await db.promise().execute(insertUserQuery, [name, description, menu_id]);
    
            res.status(201).json({ messsage: 'Hot Drinks registered successfully'});
            } catch (error) {
    
                console.error('Error registering Hot drinks:',error);
                res.status(500).json({error: 'Internal Server Error' });
        }
    });
//Show Single Menu
    router.get('/HotDrink/:id', authenticateToken ,async(req,res) => {

        let user_id = req.params.id;
    
        if(!user_id){
            return res.status(400).send({error: true, message:'Please provide user id'});
        }
    
        try {
    
            db.query('SELECT id, name, description, menu_id FROM Hot_drinks WHERE id = ?;', user_id, (err, result) =>{
    
                if(err) {
                    console.error('Error fetching items', err);
                    res.status(500).json({message: 'Internal Server Error'});
                } else {
                    res.status(200).json(result);
                }
            });
        } catch (error) {
            console.error('Error loading Hot_drinks: ', error);
            res.status(500).json({message: 'Internal Server Error'});
        }
    
    
    });
   
    //Get all Food
    router.get('/AllHotDrinks',authenticateToken, (req, res) => {
    
        try {
    
            db.query('SELECT id, name, description FROM Hot_drinks', (err, result) =>{
    
                if(err){
                    console.error('error fetching items', err);
                    res.status(500).json({message: 'Internal Server Error'});
                } else{
                    res.status(200).json(result);
                }
            });
        } catch (error) {
    
            console.error('Error loading Hot_drinks', error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    
    
    });
    

    //Authentication Function
    function authenticateToken(req, res, next) {
    
        const token = req.headers.authorization;
    
        if(!token) {
            return res.status(401).json({error: 'Unauthorized'});
        }
    
        jwt.verify(token, secretKey, (err, user) => {
    
            if(err) {
                return res.status(403).json({error: 'Forbidden'});
            }
    
            res.user = user;
            next();
        });
    }
    
    
    // //Update single user
    router.put('/UpdateHotDrinks/:id', authenticateToken,async(req, res) => {
    
        let user_id = req.params.id;
    
        const {id, name, description, menu_id} = req.body;
        
    
        if( !name ||!name||!description||!menu_id){
            return res.status(400).send({error: true, message:'Please provide name'});

        }
    
        try {
    
            db.query('UPDATE Hot_drinks SET name = "?", description = "?", menu_id = "?" WHERE id = ?', [id, name, description, menu_id, user_id], (err, result, fields) =>{
    
                if(err) {
                    console.error('Error Updating items', err);
                    return res.status(500).json({message: 'Internal Server Error'});
                } else {
                    // return res.status(200).json(result);
                }
            });
        } catch (error) {
            console.error('Error loading Hot_drinks: ', error);
            return res.status(500).json({message: 'Internal Server Error'});
        }
    
        return res.json({id, name, description, menu_id});
    });

    // router.get("/", function (req, res) {
    //     onAuthStateChanged(auth, (user) => {
    //         signStatus = 0;
    //         if (user) {
    //             signStatus = 1;
    //         } else {
    //             signStatus = 0;
    //         }
    //         return res.render("index", { signStatus: signStatus })   // 2nd response...
    //     });
    // })

    //delete a Menu
    router.delete('/deleteHotDrinks/:id', authenticateToken,(req, res) => {
    
      let user_id = req.params.id;
    
      if (!user_id) {
        return res.status(400).send({ error: true, message: ' Please provide user_id' });
      }
    
      try {
    
        db.query('DELETE FROM Hot_drinks WHERE id = ?', user_id, (err, result, fields) => {
          
          if (err) {
            console.error('Error deleting Hot Drinks:', err);
            res.status(500).json({ message: 'Internal Server Error' });
          } else {
            res.status(200).json(result);
          }
        });
    
      } catch (error) {
    
        console.error('Error loading user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
    
    router.get('/', (req, res) => {
        res.json({message: 'Restful API Backend Using ExpressJS'});
    });

    return router;
};
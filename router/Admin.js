const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();


// app.use(bodyParser.json());
//Register 
module.exports = (db, secretKey) => {

    //Register admin
    router.post('/adminRegister',async(req,res) => {

        try {
    
            const {name, username, password} = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
    
            const insertUserQuery = 'INSERT INTO Admin(name, username, password) VALUES(?,?,?)';
            await db.promise().execute(insertUserQuery, [name, username, hashedPassword]);
    
            res.status(201).json({ messsage: 'Admin registered successfully'});
            } catch (error) {
    
                console.error('Error registering Admin:',error);
                res.status(500).json({error: 'Internal Server Error' });
        }
    });

    //Login
    router.post('/AdminLogin',async (req, res) => {
    
        try {
            const { username, password} = req.body;
    
            const getUserQuery = 'SELECT * FROM Admin WHERE username = ?';
            const [rows] = await db.promise().execute(getUserQuery, [username]);
    
            if (rows.length == 0) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
    
            const user = rows[0];
            const passwordmatch = await bcrypt.compare(password, user.password);
    
            if (!passwordmatch) {
                return res.status(401).json({error: 'Invalid username or password' });
            }
    
            const token = jwt.sign({ userId: user.id, username: user.username },secretKey,{ expiresIn: '24h'});
    
            res.status(200).json({token});
            } catch (error) {
                console.error('Error logging in user:',error);
                res.status(500).json({ error: 'Internal Server Error '});
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
    
    
    //Update Admin
    router.put('/UpdateAdmin/:id', authenticateToken, async(req, res) => {
    
        let user_id = req.params.id;
    
        const {name, username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
    
        if( !user_id || !name|| !username|| !password){
            return res.status(400).send({error: true, message:'Please provice name, username and password'});

        }
    
        try {
    
            db.query('UPDATE Admin SET name = ?, username = ?, password = ? WHERE id = ?', [name, username, hashedPassword, user_id], (err, result, fields) =>{
    
                if(err) {
                    console.error('Error Updating items', err);
                    return res.status(500).json({message: 'Internal Server Error'});
                } else {
                    // return res.status(200).json(result);
                }
            });
        } catch (error) {
            console.error('Error loading user: ', error);
            return res.status(500).json({message: 'Internal Server Error'});
        }
    
        return res.json({user_id, name, username, hashedPassword});
    });

    router.get("/", function (req, res) {
        onAuthStateChanged(auth, (user) => {
            signStatus = 0;
            if (user) {
                signStatus = 1;
            } else {
                signStatus = 0;
            }
            return res.render("index", { signStatus: signStatus })   // 2nd response...
        });
    })

    //delete admin
    router.delete('/DeleteAdmin/:id', authenticateToken, (req, res) => {
    
      let user_id = req.params.id;
    
      if (!user_id) {
        return res.status(400).send({ error: true, message: ' Please provide user_id' });
      }
    
      try {
    
        db.query('DELETE FROM Admin WHERE id = ?', user_id, (err, result, fields) => {
          
          if (err) {
            console.error('Error deleting item:', err);
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



//Display all order
   router.get('/Orders', (req, res) => {
    
        try {
    
            db.query('SELECT co.id AS order_id, co.Customer_name, co.ExpectedDelivery_Date, co.Order_status, f.name AS food_name, hd.name AS hot_drink_name, cd.name AS cold_drink_name, d.name AS dessert_name FROM Customer_order co LEFT JOIN Food f ON co.food_id = f.id LEFT JOIN Hot_drinks hd ON co.hd_drink_id = hd.id LEFT JOIN cold_drinks cd ON co.cd_drink_id = cd.id LEFT JOIN Desserts d ON co.dessert_id = d.id;', (err, result) =>{
    
                if(err){
                    console.error('error fetching items', err);
                    res.status(500).json({message: 'Internal Server Error'});
                } else{
                    res.status(200).json(result);
                }
            });
        } catch (error) {
    
            console.error('Error loading users', error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    
    
    });
    
    // Display menu
    router.get('/Menu', (req, res) => {
    
        try {
    
            db.query('SELECT "Food" AS category, name, description, id FROM Food UNION SELECT "Hot Drinks" AS category, name, description, id FROM Hot_drinks UNION SELECT "Cold Drinks" AS category, name, description, id FROM cold_drinks UNION SELECT "Desserts" AS category, name, description, id FROM Desserts;', (err, result) =>{
    
                if(err){
                    console.error('error fetching items', err);
                    res.status(500).json({message: 'Internal Server Error'});
                } else{
                    res.status(200).json(result);
                }
            });
        } catch (error) {
    
            console.error('Error loading users', error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    
    
    });


    //add order
    router.post('/addOrder',async(req,res) => {

        try {
    
            const {Customer_name, Address, ExpectedDelivery_Date, Order_status, food_id, hd_drink_id, cd_drink_id, dessert_id} = req.body;
            
    
            const insertUserQuery = 'INSERT INTO Customer_order (Customer_name, address, ExpectedDelivery_Date, Order_status, food_id, hd_drink_id, cd_drink_id, dessert_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?);';
            await db.promise().execute(insertUserQuery, [Customer_name, Address, ExpectedDelivery_Date, Order_status, food_id, hd_drink_id, cd_drink_id, dessert_id]);
    
            res.status(201).json({ messsage: 'Order registered successfully'});
            } catch (error) {
    
                console.error('Error registering Customer:',error);
                res.status(500).json({error: 'Internal Server Error' });
        }
    });

    return router;
};
//const { compareSync } = require('bcrypt-nodejs');
const express = require('express');
const router = express.Router();
const TurndownService = require('turndown')

const models = require('../models');


//GET for add
router.get('/add', (req, res) => {
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;

    if(!userId || !userLogin) { //если пользователь не авторизован его перебрасывает на главную(неавторизованный пользователь не может редактировать пост)
        res.redirect('/')
    } else {
       res.render('post/add', {
        user: {
            id: userId, 
            login: userLogin
        }
      }); 
    }

    
});

//POST is add
router.post('/add', (req, res) => {
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;

    if(!userId || !userLogin) {
        res.redirect('/')
    } else {
        const title = req.body.title.trim().replace(/ +(?= )/g, ''); //начиная с trim очищаем заголовок, первое убирает пробелы сначала и в конце, а вторая убирает двойные пробелы(сделает двойные пробелы одним)
        const body = req.body.body;
        const turndownService = new TurndownService()

        if (!title || !body ){ //условие, что заголовок и текст не могут быть пустыми
            const fields = [];
            if (!title) fields.push('title');
            if (!body) fields.push('body');

            res.json({
                ok:false,
                error: 'Все поля должны быть заполнены!',
                fields
            });
        }   else if (title.length < 3 || title.length > 128) { //длина заголовка
            res.json({
                ok: false,
                error: 'Длина заголовка от 3 до 128 символов!',
                fields: ['title']
            });
        }   else if (body.length < 3) { //длина текста
            res.json({
                ok: false,
                error: 'Длина текста должна быть не менее 3 символов!',
                fields: ['body']
            });
        }   else {
            models.Post.create({
                title,
                body: turndownService.turndown(body),
                owner: userId
            })
                .then(post => { //если все условия выполнены в консоль прилетает ok: true и мы уверены, что пост добавлен на сайт
                    console.log(post)
                    res.json({
                        ok: true
                    }); 
                })
                .catch(err => {
                    console.log(err);
                    res.json({
                        ok: false
                    }); 
                });     
        }  
    }   
});

module.exports = router;

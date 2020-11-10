const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');

const models = require('../models');

//POST is register
router.post('/register', (req, res) => {
    const login = req.body.login;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;

    if (!login || !password || !passwordConfirm){
        const fields = [];
        if (!login) fields.push('login');
        if (!password) fields.push('password');
        if (!passwordConfirm) fields.push('passwordConfirm');

        res.json({ //не даём пользователю создать "пустой" аккаунт(без имени и пароля)
            ok:false,
            error: 'Все поля должны быть заполнены!',
            fields
        });
    } else if (!/^[a-zA-Z0-9]+$/.test(login)) { //делаем чтобы были латинские буквы и цифры
        res.json({
            ok: false,
            error: 'Только латинские буквы и цифры!',
            fields: ['login']
        });

    } else if (login.length < 3 || login.length > 16) { //проверяем длину логину
        res.json({
            ok: false,
            error: 'Длина логина от 3 до 16 символов!',
            fields: ['login']
        });
    } else if (password !== passwordConfirm) { //проверяем совпадение паролей
        res.json({
            ok: false,
            error: 'Пароли не совпадают!',
            fields: ['password', 'passwordConfirm']
        });
    } else if (password.length < 6) { //длина пароля не меньше 6 символов
        res.json({
            ok: false,
            error: 'Минимальная длина пароля 6 символов!',
            fields: ['password']
        });
    } else {

        models.User.findOne({ //создаём пользователя/выводим ошибку в случае не удачи создания
            login
        }).then(user => {
            if (!user) {
                bcrypt.hash(password, null, null, (err, hash) => {
                models.User.create({
                    login,
                    password: hash
                })
                .then(user => { //если всё выполняется правильно то зен
                    console.log(user);
                    req.session.userId = user.id;
                    req.session.userLogin = user.login;
                    res.json({
                        ok: true
                    });
                })
                .catch(err => { //если ошибки то выполняется кетч
                    console.log(err);
                    res.json({
                        ok: false,
                        error: 'Ошибка, попробуйте позже!'
                        });
                    });
                });   
            } else {
                res.json({ //не допускаем повторение логинов
                    ok: false,
                    error: 'Имя занято!',
                    fields: ['login']
                });
            }
        })        
    }
});

//POST is authorized
router.post('/login', (req, res) => {
    const login = req.body.login;
    const password = req.body.password;
    
    if (!login || !password){
        const fields = [];
        if (!login) fields.push('login');
        if (!password) fields.push('password');

        res.json({
            ok:false,
            error: 'Все поля должны быть заполнены!',
            fields
        });
    } else {
        models.User.findOne({ //поиск пользователя(логин) в базе данных
            login
        }).then(user => {
            if (!user) {
                res.json({
                    ok:false,
                    error: 'Логин и пароль неверны!',
                    fields: ['login', 'password']
                });
            } else {
                bcrypt.compare(password, user.password, function(err, result) { //проверка совместимости логина и пароля пользователя
                    if (!result) {
                        res.json({
                            ok:false,
                            error: 'Логин и пароль неверны!',
                            fields: ['login', 'password']
                        });  
                    } else {
                        req.session.userId = user.id;
                        req.session.userLogin = user.login;
                        res.json({
                            ok: true
                        });
                    }
                });
            }
        })
        .catch(err => { 
            console.log(err);
            res.json({
                ok: false,
                error: 'Ошибка, попробуйте позже!'
                });
            });
    }
});

//GET for logout
router.get('/logout', (req, res) => {
    if (req.session) { //если в сессии есть что-то, удаляем из неё всё и перенаправляем на главную, если ничего нет просто перенаправляем на главную
        //delete session object
        req.session.destroy(() => {
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
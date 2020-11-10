const express = require('express');
const router = express.Router();

const config = require('../config');
const models = require('../models');

    async function posts(req, res) {
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;  
    const perPage = +config.PER_PAGE; // плюс чтобы привести к типу number, а компилится как строка(из-за того, что не строгая типизация)
    const page = req.params.page || 1;

    try {
        const posts = await models.Post.find({}) //возвращает массив с объектами /* берём переменную(posts) которая в первом then'е*/
            .skip(perPage * page - perPage)
            .limit(perPage)
            .populate('owner')
            .sort({ createdAt: -1});  
            
            const count = await models.Post.count();

            res.render('archive/index', {
                posts,
                current: page,
                pages: Math.ceil(count / perPage),
                user: {
                    id: userId, 
                    login: userLogin
                }
            });
            
    } catch (error) {
        throw new Error('Server Error');  
    }
    

    // models.Post.find({}) //возвращает массив с объектами
    //     .skip(perPage * page - perPage)
    //     .limit(perPage)
    //     .populate('owner')
    //     .sort({ createdAt: -1}) //обратная сортировка, чтобы посты шли от новых к старым(по дефолту у монгуза идёт от старых к новым)
    //     .then(posts => {
    //         models.Post.count()
    //             .then(count => {
    //                 res.render('archive/index', {
    //                     posts,
    //                     current: page,
    //                     pages: Math.ceil(count / perPage),
    //                     user: {
    //                         id: userId, 
    //                         login: userLogin
    //                     }
    //                 });
    //             })
    //     .catch(() => {
    //         throw new Error('Server Error');
    //     });
    // })
    // .catch(() => {
    //     throw new Error('Server Error');
    // });
}

// routers
router.get('/', (req, res) => posts(req, res));
router.get('/archive/:page', (req, res) => posts(req, res));

router.get('/posts/:post', async (req, res, next) => {
    const url = req.params.post.trim().replace(/ +(?= )/g, '');
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;

    if (!url) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    } else {

        try {
           const post = await models.Post.findOne({ //возвращает один объект поста
            url
        });

            if (!post) {
                const err = new Error('Not Found');
                err.status = 404;
                next(err);
            } else {
                res.render('post/post', {
                    post,
                    user: {
                        id: userId, 
                        login: userLogin
                    }
                });
            }

        } catch (error) {
            throw new Error('Server Error');   
        }
        
        // models.Post.findOne({ //возвращает один объект поста
        //     url
        // }).then(post => {
        //     if (!post) {
        //         const err = new Error('Not Found');
        //         err.status = 404;
        //         next(err);
        //     } else {
        //         res.render('post/post', {
        //             post,
        //             user: {
        //                 id: userId, 
        //                 login: userLogin
        //             }
        //         });
        //     }
        // }); 
    }
});

//users posts
router.get('/users/:login/:page*?', async (req, res) => { //делаем страницу пользователя
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;  
    const perPage = +config.PER_PAGE; // плюс чтобы привести к типу number, а компилится как строка(из-за того, что не строгая типизация)
    const page = req.params.page || 1;
    const login = req.params.login;

    try {
        const user = await  models.User.findOne({
            login
        });

        const posts = await models.Post.find({ //возвращает массив с объектами
            owner: user.id 
         }) 
             .skip(perPage * page - perPage)
             .limit(perPage)
             .sort({ createdAt: -1}); //обратная сортировка, чтобы посты шли от новых к старым(по дефолту у монгуза идёт от старых к новым)

        const count = await models.Post.count({
            owner: user.id    
            });

        res.render('archive/user', {
            posts,
            _user: user,
            current: page,
            pages: Math.ceil(count / perPage),
            user: {
                id: userId, 
                login: userLogin
            }
        });
    } catch (error) {
        throw new Error('Server Error');  
    }

    // models.User.findOne({
    //     login
    // }).then(user => {
    //     models.Post.find({ //возвращает массив с объектами
    //        owner: user.id 
    //     }) 
    //         .skip(perPage * page - perPage)
    //         .limit(perPage)
    //         .sort({ createdAt: -1}) //обратная сортировка, чтобы посты шли от новых к старым(по дефолту у монгуза идёт от старых к новым)
    //         .then(posts => { 
    //             models.Post.count({
    //                 owner: user.id    
    //             })
    //                 .then(count => {
    //                     res.render('archive/user', {
    //                         posts,
    //                         _user: user,
    //                         current: page,
    //                         pages: Math.ceil(count / perPage),
    //                         user: {
    //                             id: userId, 
    //                             login: userLogin
    //                         }
    //                     });
    //                 })
    //                 .catch(() => {
    //                     throw new Error('Server Error');
    //                 });
    //             })
    //             .catch(() => {
    //                 throw new Error('Server Error')
    //             });    
    // });
});

module.exports = router;
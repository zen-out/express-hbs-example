const express = require("express")
const app = express()
const hbs = require("express-hbs")
var fs = require('fs');
var fp = require('path');
const helpers = require("handlebars-helpers")()
const i18n = require("i18n")
const cookieParser = require("cookie-parser")


function relative(path) {
    return fp.join(__dirname, path);
}


var viewsDir = relative('views');

app.use(express.static(relative('public')));

app.engine('hbs', hbs.express4({
    partialsDir: [relative('views/kanban'), relative('views/partials-chill'),
        relative('views/partials-cute'), relative('views/partials-pro')
    ],
    // layoutsDir: relative('views/layout'),
    defaultLayout: relative('views/layout/main.hbs'),
    i18n: i18n.configure({
        locales: ['en', 'fr'],
        cookie: 'locale',
        directory: __dirname + "/locales"
    })
}));
// cookies are needed
app.use(cookieParser());

// init i18n module
app.use(i18n.init);
app.set('view engine', 'hbs');
app.set('views', relative('views'));
// Register sync helper
hbs.registerHelper(helpers)
hbs.registerHelper('link', function(text, options) {
    var attrs = [];
    for (var prop in options.hash) {
        attrs.push(prop + '="' + options.hash[prop] + '"');
    }
    return new hbs.SafeString('<a ' + attrs.join(' ') + '>' + text + '</a>');
});

// Register Async helpers
hbs.registerAsyncHelper('readFile', function(filename, cb) {
    fs.readFile(fp.join(viewsDir, filename), 'utf8', function(err, content) {
        if (err) console.error(err);
        cb(new hbs.SafeString(content));
    });
});

// set a cookie for language
app.use(function(req, res, next) {
    // check if client sent cookie
    var cookie = req.cookies.locale;
    if (cookie === undefined) {
        // no: set a new cookie
        res.cookie('locale', "en", {
            maxAge: 900000,
            httpOnly: true
        });
        console.log('cookie created successfully');
    } else {
        // yes, cookie was already present 
        console.log('cookie exists', cookie);
    }
    next(); // <-- important!
});

app.get("/", async (req, res) => {
    res.render("index", {
        user: {
            id: 1,
            theme: "chill",
            email: "lesley@bu.edu"
        }
    })
})

// render based on theme 
app.get("/kanban", async (req, res) => {
    res.render("kanban/kanban", {
        user: {
            id: 1,
            theme: "chill",
            email: "lesley@bu.edu"
        },
        // dashboard has {{{body}}}
        layout: relative('views/layout/dashboard'),
        problem: [{
            id: 1,
            problem: "theme",
            whatactuallyis: "figuring out components",
            whatshouldbe: "should be liek this",
            hypothesis: "do simple example",
            plan: "use this library",
            task: [{
                id: 1,
                name: "play with simple example, changing theme on a page"
            }]
        }]
    })
})

app.listen(3000, () => {
    console.log("app listening on port 3000")
})
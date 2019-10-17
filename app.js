const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');

const port = 8000;
const responsedelay = 50;   // miliseconds
const filespath = `./files`;


// static folders
app.use(express.static('public'));
app.use(express.static(filespath));
app.use(express.static('view'));

// home page
app.get('/', function(req, res)
{
    res.sendFile('index.html');
});

// upload handler
var uploadStorage = multer.diskStorage(
{
    destination: function (req, file, cb)
    {
        cb(null, filespath);
    },
    filename: function (req, file, cb)
    {
        cb(null, file.originalname);
    }
});

var upload = multer({ storage: uploadStorage });

app.post('/', upload.single('file'), function(req, res)
{
    console.log(req.file);
    console.log('file upload...');
});

// all type of files except images will explored here
app.get('/files-list', function(req, res)
{
    let response = [];
    let contents = '';

    fs.readdir(filespath, function(err, files)
    {
        if(err)
        {
            console.log(err);
            res.send(contents).status(200); // or 404
        }
        else if(files.length > 0)
        {
            files.forEach(function(value, index, array)
            {
                console.log(index);
                fs.stat(`${filespath}/${value}` , function(err, stats)
                {
                    let filesize = ConvertSize(stats.size);
                    response.push({name: value, size: filesize, uploadDate: stats.birthtime});
                    
                    if(index == (array.length - 1)) { setTimeout(function() {res.send(JSON.stringify(response)).status(200);}, responsedelay); }
                });
            });
        }
        else
        {
            setTimeout(function() {res.send(contents).status(200);}, responsedelay);
        }
    });
});

/**
 * it gives a number as byte and convert it to KB, MB and GB (depends on file size) and return the result as string.
 * @param number file size in Byte
 */
function ConvertSize(number)
{
    if(number <= 1024) { return (`${number} Byte`); }
    else if(number > 1024 && number <= 1048576) { return ((number / 1024).toPrecision(3) + ' KB'); }
    else if(number > 1048576 && number <= 1073741824) { return ((number / 1048576).toPrecision(3) + ' MB'); }
    else if(number > 1073741824 && number <= 1099511627776) { return ((number / 1073741824).toPrecision(3) + ' GB'); }
}

// start server
app.listen(port, function()
{
    console.log(`Server is started on port: ${port}`);
});
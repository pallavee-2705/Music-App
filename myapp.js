var fs = require('fs');
var express = require('express');
var app = express();
app.use(express.json());
app.use('/', express.static('static'));
var PORT = process.env.PORT || 8080;
var Joi =require('joi');

app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });
  app.get('/', function(req, res, next) {
    // Handle the get for this route
  });
  app.post('/', function(req, res, next) {
    // Handle the post for this route
  });

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', '*');
//     res.setHeader('Access-Control-Allow-Headers', '*');
// });
// app.use('/', express.frontend('static'));
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

  var my_genres = JSON.parse(fs.readFileSync("lab3-data/genres.json", 'utf8'));
  var my_artists = JSON.parse(fs.readFileSync("lab3-data/raw_artists.json", 'utf8'));
  //var albums = JSON.parse(fs.readFileSync("lab3-data/raw_albums.json", 'utf8'));
  var raw_tracks = JSON.parse(fs.readFileSync("lab3-data/raw_tracks.json", 'utf8'));
  let NewList = JSON.parse(fs.readFileSync("lists.json", 'utf8'));
  let PlayList = JSON.parse(fs.readFileSync("playlist.json", 'utf8'));


//api 1
  app.get('/api/genres_api1', (req, res) => {
    var genres_info_api1 =[];
    my_genres.forEach(ginfo => {
    let genre_details = {
        Genre_id: ginfo.genre_id,
        Parent : ginfo.parent,
        Title: ginfo.title
    }
    genres_info_api1.push(genre_details);
  })
    res.json(genres_info_api1);
  });

  //api2
  app.get('/api/artist_api2/:artist_id', (req, res) => {

    const schema = Joi.object({

        artist_id: Joi.string().regex(/[0-9]$/).max(7).required()

    });
    const result = schema.validate(req.params);


 if(result.error){

        res.status(400).send("Bad Request. Artist ID should be numeric and must be less then 6 characters")

    }
    else{
        var artist_arr = my_artists.find(art => parseInt(art.artist_id) == parseInt(req.params.artist_id.trim()));
    let { artist_id,
        artist_name,
        artist_contact,
        artist_members,
        artist_favorites,
        artist_handle} = artist_arr;
    res.json({
        Artist_ID : artist_id,
        Artist_Name : artist_name,
        Artist_Contact : artist_contact,
        Artist_Members : artist_members,
        Artist_Favourites : artist_favorites,
        Artist_Handle : artist_handle
    });
    }
});


//api3
app.get('/api/track_api3/:track_id', (req, res) => {
    const track_schema = Joi.object({

        track_id: Joi.string().regex(/[0-9]$/).max(6).required()

    });

    const track_result = track_schema.validate(req.params);

 if(track_result.error){

        res.status(400).send("Bad Request. Track ID should be numeric and must be less then 6 characters")

    }
    else{
        
    var track_arr = raw_tracks.find(tr => parseInt(tr.track_id) == parseInt(req.params.track_id.trim()));
    let { album_id,
        album_title,
        artist_id,
        artist_name,
        tags,
        track_date_created,
        track_date_recorded,
        track_duration,
        track_genres,
        track_number,
        track_title } = track_arr;
    res.json({
        Album_ID : album_id,
        Album_Title : album_title,
        Artist_Id : artist_id,
        Artist_Name : artist_name,
        Tags : tags,
        Track_Date_Created : track_date_created,
        Track_Date_Recorded : track_date_recorded,
        Track_Duration : track_duration,
        Track_Genres : track_genres,
        Track_Number : track_number,
        Track_Title : track_title
    });
    }
});

//api4
app.get('/api/track_title_api4/:trk_title', (req, res) => {
    const schema4 = Joi.object({

        trk_title: Joi.string().max(30).required()

    });
    const result4 = schema4.validate(req.params);

    if(result4.error){

        res.status(400).send("Bad Request. Track title must be less then 30 characters")

    }
    else{
 

        let track_info_var = raw_tracks.filter(tr => tr.track_title.toString().toLowerCase().includes(req.params.trk_title.toLowerCase()) || tr.album_title.toString().toLowerCase().includes(req.params.trk_title.toLowerCase()));
        let track_var = [];
        track_info_var.forEach(t => {
            track_var.push(t.track_id);
        });
        if (track_var.length > 2) {
            track_var = track_var.slice(0,2);
        }
        var final_track = JSON.stringify(track_var);
        res.json(final_track);
      
    }
});


//api5
app.get('/api/artist_api5/:artist_name', (req, res) => {
    const schema5 = Joi.object({

        artist_name: Joi.string().max(30).required()

    });
    const result5 = schema5.validate(req.params);

    if(result5.error){

        res.status(400).send("Bad Request. Artist Name must be less then 30 characters")

    } 
    else{
        var artist_arr_2 = my_artists.filter(ar => ar.artist_name.toString().toLowerCase().includes(req.params.artist_name.toLowerCase()));
        let artist_list_arr = [];
        artist_arr_2.forEach(ar => {
            artist_list_arr.push(ar.artist_id);
        });
        var art_list = JSON.stringify(artist_list_arr);
        res.json(art_list);

    }
  
});


//api6
app.post('/api/AddNewList', (req, res) => {
  var CheckList = false;
  NewList.forEach(li => {
      if (li.Li_Name.toString().localeCompare(req.body.Li_Name) == 0) {
          CheckList = true;
      }
  });
  if (CheckList) {
      res.status(400).send("This List Already Exists");
  }
  else {
      var track = {
         Li_Name: req.body.Li_Name,
          Tracks: req.body.Tracks
      }
      NewList.push(track);
      var New_List = JSON.stringify(NewList);
      fs.writeFile('lists.json', New_List, err => {
          if (err) 
              throw err;
      });
      res.status(200).send("List added successfully.");
    }
});


//api7
app.put('/api/UpdateList', (req, res) => {
    var ListNameAvailable = false;
    NewList.forEach(li => {
        if (li.Li_Name.toString().localeCompare(req.body.Li_Name) == 0) {
            ListNameAvailable = true;
        }
    });

    if (!ListNameAvailable) {
        res.status(200).send("List doesn't exist");
    }

    else {
        let Tracks_Add = req.body.Tracks;
        NewList.forEach(li => {
            if (li.Li_Name.toString().localeCompare(req.body.Li_Name) == 0) {
                li.Tracks = Tracks_Add;
            }
        });

        var UpdatedList = JSON.stringify(NewList);
        fs.writeFile('lists.json', UpdatedList, err => {
            if (err) throw err;
        });
        res.status(200).send("New Tracks Added to The List Successfully.");
    }

});


//api8
app.get('/api/ReturnList/:NameOfList', (req, res) => {
  var track_Id = [];
  NewList.forEach(li => {
      if (li.Li_Name.toString().localeCompare(req.params.NameOfList) == 0) 
      {
          //console.log(li.Li_Name.toString() + " :: " + req.params.NameOfList);
          var tracks_list = li.Tracks;
          tracks_list.forEach(track => {
              track_Id.push(track.id);
          });
      }
  });
  res.json(track_Id);
});


//api9
app.delete('/api/ListDeleting/:deletelistName', (req, res) => {
  var ListCheck = false;
  var index_var = 0;
  NewList.forEach(li => {
      if (li.Li_Name.toString().localeCompare(req.params.deletelistName) == 0) {
          ListCheck = true;
          index_var = NewList.indexOf(li);
      }
  });
  if (!ListCheck) {
      res.status(400).send("This List does not exist");
  }
  else {
      NewList.splice(index_var, 1);
      let tracks_list = JSON.stringify(NewList);
      fs.writeFile('lists.json', tracks_list, err => {
          if (err) throw err;
      });
      res.status(200).send("List deleted successfully");
    }
});



// Front end API 1 


app.get('/api/SearchMusicData/:name', (req, res) => {
    var Music_info = raw_tracks.filter(trk => trk.track_title.toString().toLowerCase().includes(req.params.name.toLowerCase()) || trk.album_title.toString().toLowerCase().includes(req.params.name.toLowerCase()) || trk.artist_name.toString().toLowerCase().includes(req.params.name.toLowerCase()))
    res.json(Music_info);
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));

  

//Front end API 2
app.post('/api/PostList', (req, res) => {
    var CheckIfList = false;
    PlayList.forEach(lis => {
        if (lis.Name.toString().localeCompare(req.body.Name) == 0) {
            CheckIfList = true;
        }
    });
    if (CheckIfList) {
        res.status(400).send("This List Already Exists");
    }
    else {
        var play_track = {
           Name: req.body.Name,
           Title: req.body.Title,
           Artist: req.body.Artist,
           Album: req.body.Album,
           Playtime: req.body.Playtime
        }
        PlayList.push(play_track);
        var The_List = JSON.stringify(PlayList);
        fs.writeFile('playlist.json', The_List, err => {
            if (err) 
                throw err;
        });
        res.status(200).send("List added successfully.");
      }
  });
  
  

  
  

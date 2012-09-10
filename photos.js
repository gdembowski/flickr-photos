/*global jQuery*/

var setupPhotos = (function ($) {
    function each (items, callback) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
            //callback.call(this, items[i]);
        }
    }

    function flatten (items) {
        return items.reduce(function (a, b) {
            return a.concat(b);
        });
    }

    function loadPhotosByTag (tag, max, callback) {
        var photos = [];
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);

        window[callback_name] = function (data) {
            delete window[callback_name];
            var i;
            for (i = 0; i < max; i += 1) {
                photos.push(data.items[i].media.m);
            }
            callback(null, photos);
        };

        $.ajax({
            url: 'http://api.flickr.com/services/feeds/photos_public.gne',
            data: {
                tags: tag,
                lang: 'en-us',
                format: 'json',
                jsoncallback: callback_name
            },
            dataType: 'jsonp'
        });
    }

    function loadAllPhotos (tags, max, callback) {
        var results = [];
        function handleResult (err, photos) {
            if (err) { return callback(err); }

            results.push(photos);
            if (results.length === tags.length) {
                callback(null, flatten(results));
            }
        }

        each(tags, function (tag) {
            loadPhotosByTag(tag, max, handleResult);
        });
    }

    function renderPhoto (photo) {
        var img = new Image();
        img.src = photo;
        return img;
    }

    function imageAppender (id) {
        var holder = document.getElementById(id);
        return function (img) {
		
			
            var elm = document.createElement('div');
			var heart = document.createElement('i');
			if (checkFav(img.src) !== false) {
				heart.className = 'icon-heart';
			} else {
				heart.className = 'icon-heart-empty';
			}
			
            elm.className = 'photo';
            elm.appendChild(img);
			elm.appendChild(heart);
            holder.appendChild(elm);
        };
    }

    // ----
    
    var max_per_tag = 5;
    return function setup (tags, callback) {
        loadAllPhotos(tags, max_per_tag, function (err, items) {
            if (err) { return callback(err); }

            each(items.map(renderPhoto), imageAppender('photos'));
            callback();
        });
    };
}(jQuery));

// -------

function checkFav(imglink) {
	var favs = [];
	if(typeof(Storage)!=="undefined") {
		if (localStorage.getItem('favLinks') && localStorage.getItem('favLinks').length > 0) {
			favs = JSON.parse(localStorage.getItem('favLinks'));
		}
		
	}
	
	
	if (favs !== null && favs.length > 0) {
		// search in array
		if (favs.indexOf(imglink) != -1) {
			return favs.indexOf(imglink);
		}
	}
	return false;
}


function clickFav(imglink, callback) {
	
	var check = checkFav(imglink);
	
	if(typeof(Storage) !== "undefined") {
		// SessionStorage
		var stored = [];
		if (localStorage.getItem('favLinks') && localStorage.getItem('favLinks').length > 0) {
			stored = JSON.parse(localStorage.getItem('favLinks'));
		}
		
		if (check === false) {
			// Not found - insert
			if (stored !== null && stored.length > 0) {
				stored.push(imglink);
			} else {
				stored = [imglink];
			}
		} else {
			// Found - delete
			if (stored !== null && stored.length > 0) {
				stored.splice(check, 1);
			}
		}
		// SetData
		try {
			localStorage.setItem('favLinks', JSON.stringify(stored));
		} catch(e) {
			localStorage.removeItem('favLinks');
			alert("Storage error");
		}
	} else {
		console.error("Update your broswer");
	}
	
	
	// Visual work
	callback(check);
}

/*

 jQuery
 
$('div.photo i').live('click', function() {
	var link = $(this).prev('img').attr('src');
	elem = $(this);

	clickFav(link, function(state) {
		elem.attr('class', '');

		if (state === false) {
			// Add to Favs
			elem.attr('class', 'icon-heart');
		} else {
			// Remove from Favs
			elem.attr('class', 'icon-heart-empty');
		}
	
	});

});
*/


document.onclick = function(event) {
    el = event.target;
    if (el.nodeName == "I") {
		var link = el.parentNode.firstChild.getAttribute("src");
    
		clickFav(link, function(state) {
			el.removeAttribute('class');

			if (state === false) {
				// Add to Favs
				el.setAttribute('class', 'icon-heart');
			} else {
				// Remove from Favs
				el.setAttribute('class', 'icon-heart-empty');
			}
		
		});
    }
};
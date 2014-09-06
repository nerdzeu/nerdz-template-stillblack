$(document).ready(function() {
    var loading = N.getLangData().LOADING;
    $("iframe").attr('scrolling','no');
    $("body").append($('<br />'));
    // append version information
    if ($("#left_col").length && window.location.pathname == "/home.php" && typeof Nversion !== 'undefined' && Nversion != 'null')
        // according to stackoverflow, using 'target' in HTML5 is alright so let's do it
        $('#commit').html("<a id='github' href='https://github.com/nerdzeu/nerdz.eu/commit/"+ Nversion+"' target='wowsoversion'>"+Nversion+"</a>" );
    // load the prettyprinter
    $('#showinfo').on('click', function () {
        $('#infobox').slideToggle();        
    });

    $('#bug_title').on('click', function () {
        $('#bugs').slideToggle();        
    });

    var _h = $("head");
    var append_theme = "?skin=sunburst";
    var prettify = document.createElement ("script");
    prettify.type = "text/javascript";
    prettify.src  = 'https://cdnjs.cloudflare.com/ajax/libs/prettify/r298/run_prettify.js' + append_theme;
    _h.append (prettify);
    
    $("#notify").on('click',function(e) {
        e.preventDefault();
        var list = $("#notify_list"), old = $(this).html();
        var nold = parseInt(old);
        if(list.length) {
            if(isNaN(nold) || nold === 0)
            {
                list.remove();
            }
            else if(nold > 0) {
                list.prepend('<div id="pr_lo">'+loading+'</div>');
                N.html.getNotifications(function(d) {
                    $("#pr_lo").remove();
                    list.prepend(d);
                 });
            }
        }
        else {
            var l = $(document.createElement("div"));
            l.attr('id',"notify_list");
            l.html(loading);
            $("body").append(l);
            N.html.getNotifications(function(d) {
                l.html(d);
            });
    
            $("#notify_list").on('click','.notref',function(e) {
                if (e.ctrlKey) return;
                e.preventDefault();
                var href = $(this).attr('href');
                if(href == window.location.pathname + window.location.hash) {
                    location.reload();
                }
                else {
                    location.href = href;
                }
            });
        }
        $(this).html(isNaN(nold) ? old : '0');
    });

    /* il footersearch si mostra solo in alcune pagine */
    var wrongPages = [ '/bbcode.php','/terms.php','/faq.php','/stats.php','/rank.php','/preferences.php', '/informations.php', '/preview.php' ];
       if($.inArray(location.pathname,wrongPages) != -1) {
           $("#footersearch").hide();
       }

    $("#footersearch").on('submit',function(e) {
        e.preventDefault();
        var plist = $("#postlist");
        var qs =  $.trim($("#footersearch input[name=q]").val());
        var num = 10; //TODO: numero di posts, parametro?

        if(qs === '') {
            return false;
        }

        var manageResponse = function(d)
        {
            plist.html(d);
            //variabile booleana messa come stringa data che nel dom posso salvare solo stringhe
            sessionStorage.setItem('searchLoad', "1"); //e' la variabile load di search, dato che queste azioni sono in questo file js ma sono condivise da tutte le pagine, la variabile di caricamento dev'essere nota a tutte
        };

        if(plist.data('type') == 'project')
        {
            if(plist.data('location') == 'home')
            {
                N.html.search.globalProjectPosts(num, qs, manageResponse);
            }
            else
            {
                if(plist.data('location') == 'project')
                {
                    N.html.search.specificProjectPosts(num, qs, plist.data('projectid'),manageResponse);
                }
            }
        }
        else
        {
            if(plist.data('location') == 'home')
            {
                N.html.search.globalProfilePosts(num, qs, manageResponse);
            }
            else
            {
                if(plist.data('location') == 'profile')
                {
                    N.html.search.specificProfilePosts(num, qs, plist.data('profileid'),manageResponse);
                }
            }
        }
        plist.data('mode','search');
    });

    $("#logout").on('click',function(event) {
        event.preventDefault();
        var t = $("#title_right");
        N.json.logout( { tok: $(this).data('tok') }, function(r) {
            var tmp = t.html();
            if(r.status == 'ok')
            {
                t.html(r.message);
                setTimeout(function() {
                    document.location.href = "/";
                    },1500);
            }
            else
            {
                t.html('<h2>'+ r.message + '</h2>');
                setTimeout(function() {
                    t.html(tmp);
                },1500);
            }
        });
    });

    $("#gotopm").on('click',function(e) {
            e.preventDefault();

            var href = $(this).attr('href');

            if($('#pmcounter').html() != '0') {

                if(href == window.location.pathname ) {
                    location.hash = "new";
                    location.reload();
                }
                else {
                    location.href='/pm.php#new';
                }
            }
            else
            {
                location.href = href;
            }
    });

    //Questo evento deve essere qui e non in index.js (che ora viene eliminato), dato che un utente può registrarsi anche dal
    //form di registrazione, che appare quando un profilo/progetto è chiuso 
    $("#regfrm").on('submit',function(event) {
        event.preventDefault();
        N.json.register($("#regfrm").serialize(),function(obj) {
            
            if(obj.status == 'error')
            {
                $("#error").html(obj.message.replace(/\n/g,"<br />"));
                $("#cptxt").html('');
                N.reloadCaptcha();
            }
            else if(obj.status == 'ok')
            {
                $("#error").hide();
                $("#done").html(obj.message);
                setTimeout(function() {
                    window.location.reload();
                }, 1500);
            }
        });
    });

    $(".preview").on('click',function(){
        $(this).parent().children("textarea").val($(this).parent().children("textarea").val().autoLink());
        var txt = $($(this).data('refto')).val();
        if(undefined !== txt && txt !== '') {
            window.open('/preview.php?message='+encodeURIComponent(txt+' ')); //The whitespace is a workaround used to make the preview works also when there is a dot at the end of the message
        }
    });
    
    $("textarea").on('keydown', function(e) {
        if( e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13) ) {
            $(this).parent().trigger('submit');
        }
    });

    $("#stdfrm").children("input[type=submit]").on("click", function () {
        $(this).parent().children("textarea").val($(this).parent().children("textarea").val().autoLink());
    });

    //begin plist into events (common to: homepage, projects, profiles)
    var plist = $("#postlist");

    plist.on('click', ".yt_frame", function(e) {
        e.preventDefault();
        N.yt($(this), $(this).data("vid"));
    });

    plist.on('click', ".frmcomment", function () {
        $(this).children("textarea").val($(this).children("textarea").val().autoLink());
    });

    plist.on('click','.preview',function(){
        var txtarea = $($(this).data('refto'));
        txtarea.val(txtarea.val()+' '); //workaround
        var txt = txtarea.val();
        txtarea.val($.trim(txtarea.val()));
        if(undefined !== txt && $.trim(txt) !== '') {
            window.open('/preview.php?message='+encodeURIComponent(txt));
        }
    });

    plist.on('keydown',"textarea", function(e) {
        if( e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13) ) {
            $(this).parent().trigger('submit');
        }
    });

    plist.on('click',".delcomment",function() {
        var refto = $('#' + $(this).data('refto'));
        refto.html(loading+'...');

          N.json[plist.data('type')].delComment({ hcid: $(this).data('hcid') },function(d) {
            if(d.status == 'ok')
            {
                refto.remove();
            }
            else
            {
                refto.html(d.message);
            }
        });
    });

    plist.on('submit','.frmcomment',function(e) {
        e.preventDefault();
        var last, hcid,
            hpid     = $(this).data ('hpid'),
            refto    = $('#commentlist' + hpid),
            error    = $(this).find ('.error').eq (0),
            pattern  = 'div[id^="c"]',
            comments = refto.find (pattern);
        if(comments.length)
        {
            // Uses the second-last element instead of the last one (if available)
            // to fix the append bug reported by nessuno.
            last = comments.length > 1 ? comments.eq (comments.length - 2) : null;
            hcid = last ? last.data('hcid') : 0;
        }
        error.html (loading);
        N.json[plist.data('type')].addComment ({ hpid: hpid, message: $(this).find('textarea').eq(0).val() }, function(d) {
            if(d.status == 'ok')
            {
                if(hcid && last)
                {
                    N.html[plist.data('type')].getCommentsAfterHcid ({ hpid: hpid, hcid: hcid }, function(d) {
                        var form = refto.find ('form.frmcomment').eq (0),
                            pushBefore = form.parent(),
                            newComments = $('<div>' + d + '</div>').find (pattern),
                            internalLengthPointer = comments.length,
                            lastComment = comments.last();
                        // if available, delete the secondlast comment
                        if (comments.length > 1) {
                            comments.eq (comments.length - 1).remove();
                            internalLengthPointer--;
                        }
                        // then, check the hcid of the last comment
                        // delete it if it matches
                        if (lastComment.data ('hcid') == newComments.last().data ('hcid')) {
                            lastComment.remove();
                            internalLengthPointer--;
                        }
                        // wait until we reach 10 comments (except if the user pressed more)
                        // TODO: replace this with comments.slice (0, n).remove()
                        // TODO: add logic to show again the 'more' button if we deleted
                        // enough comments
                        // Fix for issue #9: add a >point<
                        while ((internalLengthPointer + newComments.length) > (((comments.parent().find ('.more_btn').data ('morecount') || 0) + 1) * 10)) {
                            comments.first().remove();
                            // reassign the variable, otherwise .first() won't work
                            // anymore with .remove().
                            comments = refto.find (pattern);
                            internalLengthPointer--;
                        }
                        // append newComments
                        pushBefore.before (d);
                        form.find ('textarea').val ('');
                        error.html('');
                    });
                }
                else
                {
                    N.html[plist.data('type')].getComments( { hpid: hpid, start: 0, num: 10 },function(d) {
                        refto.html(d);
                        error.html('');
                    });
                }
            }
            else
            {
                error.html(d.message);
            }
        });
    });

    plist.on('click',".showcomments",function() {
        var refto = $('#' + $(this).data('refto'));
        if(refto.html() === '')
        {
            refto.html(loading+'...');
            N.html[plist.data ('type')].getComments ({
                hpid: $(this).data ('hpid'),
                start: 0,
                num: 10
            }, function (res) {
                refto.html (res);
                if (document.location.hash == '#last')
                    refto.find ('.frmcomment textarea[name=message]').focus();
                else if (document.location.hash)
                    $(document).scrollTop ($(document.location.hash).offset().top);
            });
        }
        else
        {
            refto.html('');
        }
    });

    plist.on('click', ".oldrev", function() {
        var me = $(this), refto = $(this).data('refto');
        var revno = parseInt( $(this).data('revisions') );
        var func = "getRevision";
        var obj = {hpid: $(this).data('hpid'), revNo: revno};
        var id = 'hpid';

        if(me.hasClass("comment")) {
            func = "getCommentRevision";
            obj = {hcid: $(this).data('hcid'), revNo: revno};
            id = 'hcid';
        }

        if(!$(this).data('original-rev')) {
            $(this).data('original-rev', revno);
        }

        if(revno > 0) {
            N.json[plist.data('type')][func](obj, function(r) {
                var tagTime = me.parent().parent(), timeVal = null;
                if(id === 'hcid') {
                    tagTime = tagTime.find('a[id^="ndc"]');
                    console.log(tagTime);
                } else {
                    console.log(me.parent().parent());
                    tagTime = tagTime.find('time');
                    console.log(tagTime);
                }
                timeVal = tagTime.html();

                tagTime.html(r.datetime);
                if(!me.parent().find(".newrev").length) {
                    var s = $(document.createElement("span"));
                    s.attr("class", "newrev" + (id === 'hcid' ? ' comment' : ''));
                    s.attr('data-refto', refto);
                    s.attr('data-'+id, me.data(id));
                    s.html(">&nbsp;");
                    me.parent().append(s);
                }

                var div = null, pidTag = null;
                if(id === 'hcid') {
                    div = $("#" + refto).find(".nerdz_comments");
                    pidTag = $(document.createElement("span"));
                    pidTag.append( div.find(".delcomment") );
                    pidTag.html(pidTag.html() + "#1");
                    pidTag.css('font-size','0');
                } else {
                    div = $("#" + refto).find(".nerdz_message div:first");
                    pidTag = $("#" + refto).find(".nerdz_message span:first");
                    if(!div.length) {
                        div = $("#" + refto).find(".news div:first");
                        pidTag = $("#" + refto).find(".news span:first");
                    }

                    pidTag.remove();
                }

                var storeName = plist.data('type') + "store" + func;

                var elms = {};                    
                if(!sessionStorage[storeName]) { //init store
                    elms[me.data(id)] = [];
                    elms[me.data(id)][revno] = {};
                    elms[me.data(id)][revno].message = div.html();
                    elms[me.data(id)][revno].time = timeVal;
                    sessionStorage[storeName] = JSON.stringify(elms);
                } else { // store exists
                    elms = JSON.parse(sessionStorage[storeName]);
                    if(!elms[me.data(id)]) {
                        elms[me.data(id)] = [];
                    }
                    if(!elms[me.data(id)][revno]) {
                        elms[me.data(id)][revno] = {};
                        elms[me.data(id)][revno].message = div.html();
                        elms[me.data(id)][revno].time = timeVal;
                        sessionStorage[storeName] = JSON.stringify(elms);
                    }
                }

                div.html(r.message);
                if(pidTag.html().search(/^#\d+$/) != -1) {
                    pidTag.html(pidTag.html() + " - rev: " + revno);
                } else {
                    pidTag.html(pidTag.html().replace(/(#.+?):\s*(\d+)/, function($0, $1, $2) {
                        return $1 +": " + revno;
                    }));
                }
                div.prepend(pidTag);

                var rev = revno - 1;
                me.data('revisions', rev);
                if(rev === 0) {
                    me.hide();
                }
            });
        }
    });

    plist.on('click', '.newrev', function() {
        var me = $(this), refto = $(this).data('refto');

        var func = "getRevision";
        var id = 'hpid';
        var tagTime =  me.parent().parent().find('time');

        if(me.hasClass("comment")) {
            func = "getCommentRevision";
            id = 'hcid';
            tagTime = me.parent().parent().children('a[id^="ndc"]');
        }
        var storeName = plist.data('type') + "store" + func;

        if(sessionStorage[storeName]) {
            var elms = JSON.parse(sessionStorage[storeName]);
            if(elms[me.data(id)]) {

                if(id === 'hcid') {
                    div = $("#" + refto).find(".nerdz_comments");
                    pidTag = $(document.createElement("span"));
                    pidTag.append( div.find(".delcomment") );
                    pidTag.html(pidTag.html() + "#1");
                } else {
                    div = $("#" + refto).find(".nerdz_message div:first");
                    if(!div.length) {
                        div = $("#" + refto).find(".news div:first");
                    }
                    pidTag = div.find("span:first");
                    pidTag.remove();
                }

                elms[me.data(id)] = elms[me.data(id)].filter(function(v) { return v !== null; });
                div.html(elms[me.data(id)][0].message);
                tagTime.html(elms[me.data(id)][0].time);
                elms[me.data(id)][0] = null;
                elms[me.data(id)] = elms[me.data(id)].filter(function(v) { return v !== null; });
                sessionStorage[storeName] = JSON.stringify(elms);
                //update counter
                var d = me.parent().find(".oldrev");
                var rev  = parseInt(d.data('revisions')) + 1;
                d.data('revisions', rev);

                pidTag.html(pidTag.html().replace(/(#.+?):\s*(\d+)/, function($0, $1, $2) {
                    return $1 +": " + (rev == 1 ? rev+1 : rev);
                }));

                if(id === 'hcid') {
                    pidTag.css('font-size', '0');
                }

                div.prepend(pidTag);
                if(rev >= parseInt(d.data('original-rev'))){
                    me.remove();
                    pidTag.html(pidTag.html().replace(/(#\d+).*:\s*(\d+)/, function($0, $1, $2) {
                        return $1;
                    }));
                }
                d.show();
            }
        }
    });

    plist.on('click', ".vote", function() {
        var curr = $(this),
          cont = curr.parent(),
          tnum = cont.parent().children(".thumbs-counter"),
          func = "thumbs",
          obj = { hpid: cont.data("refto") };

        if(cont.hasClass("comment"))  {
            obj = { hcid: cont.data("refto") };
            func = "cthumbs";
        }
          
        if(curr.hasClass("voted")) { 
            N.json[plist.data ('type')][func]($.extend(obj,{thumb: 0}), function(r) {
                curr.removeClass("voted");
                var votes = parseInt(r.message);
                tnum.attr("class","thumbs-counter").text(votes);
                if(votes !== 0) {
                    tnum.addClass(votes>0?"nerdz_thumbsNumPos":"nerdz_thumbsNumNeg");
                }
                if(votes>0) {
                    tnum.text("+"+tnum.text());
                }
              });
        }
        else {
            N.json[plist.data ('type')][func]($.extend(obj,{ thumb: curr.hasClass("up") ? 1: -1 }), function(r) {
                cont.children(".voted").removeClass("voted");
                curr.addClass("voted");
                var votes = parseInt(r.message);
                tnum.attr("class","thumbs-counter").text(votes);
                if(votes !== 0) {
                    tnum.addClass(votes>0?"nerdz_thumbsNumPos":"nerdz_thumbsNumNeg");
                }
                if(votes>0) {
                    tnum.text("+"+tnum.text());
                }
             });
        }
    });

    plist.on ('click', '.more_btn', function() {
        var moreBtn     = $(this),
            commentList = moreBtn.parents ("div[id^=\"commentlist\"]"),
            hpid        = /^post(\d+)$/.exec (commentList.parents ("div[id^=\"post\"]").attr ("id"))[1],
            intCounter  = moreBtn.data ("morecount") || 0;
        if (moreBtn.data ("inprogress") === "1") return;
        moreBtn.data ("inprogress", "1").text (loading + "...");
        N.html[plist.data ('type')].getComments ({ hpid: hpid, start: intCounter + 1, num: 10 }, function (r) {
            moreBtn.data ("inprogress", "0").data ("morecount", ++intCounter).text (moreBtn.data ("localization"));
            var _ref = $("<div>" + r + "</div>");
            // Lesson learned: don't use .parent() after a .hide()
            moreBtn.parent().after (r);
            if (intCounter == 1)
                moreBtn.parent().find (".scroll_bottom_hidden").show();
            if ($.trim (r) === "" || _ref.find (".nerdz_from").length < 10 || (10 * (intCounter + 1)) == _ref.find (".commentcount:eq(0)").html())
            {
                var btnDb = moreBtn.hide().parent();
                btnDb.find (".scroll_bottom_separator").hide();
                btnDb.find (".all_comments_hidden").hide();
            }
        });
    });

    plist.on ('click', '.scroll_bottom_btn', function() {
        // thanks to stackoverflow for .eq(x) and for the scroll hack
        var cList = $(this).parents().eq (2);
        // Select the second last comment, do a fancy scrolling and then focus the textbox.
        $("html, body").animate ({ scrollTop: cList.find (".singlecomment:nth-last-child(2)").offset().top }, function() {
            cList.find (".frmcomment textarea").focus();
        });
    });

    plist.on ('click', '.all_comments_btn', function() {
        // TODO do not waste precious performance by requesting EVERY
        // comment, but instead adapt the limited function to allow
        // specifying a start parameter without 'num'.
        var btn         = $(this),
            btnDb       = btn.parent().parent(),
            moreBtn     = btnDb.find (".more_btn"),
            commentList = btn.parents ("div[id^=\"commentlist\"]"),
            hpid        = /^post(\d+)$/.exec (commentList.parents ("div[id^=\"post\"]").attr ("id"))[1];
        if (btn.data ("working") === "1" || moreBtn.data ("inprogress") === "1") return;
        btn.data ("working", "1").text (loading + "...");
        moreBtn.data ("inprogress", "1");
        N.html[plist.data ('type')].getComments ({ hpid: hpid, forceNoForm: true }, function (res) {
            btn.data ("working", "0").text (btn.data ("localization")).parent().hide();
            btnDb.find (".scroll_bottom_hidden").show().find (".scroll_bottom_separator").hide();
            var parsed = $("<div>" + res + "</div>"), push = $("#commentlist" + hpid);
            moreBtn.hide().data ("morecount", Math.ceil (parseInt (parsed.find (".commentcount").html()) / 10));
            push.find ("div[id^=\"c\"]").remove();
            push.find ('form.frmcomment').eq (0).parent().before (res);
        });
    });

    plist.on('click',".qu_ico",function() {
        var area = $("#"+$(this).data('refto'));
        area.val(area.val()+"[quote="+ $(this).data('hcid') +"|"+$(this).data('type')+"]");
        area.focus();
    });

    plist.on('click',".delpost",function(e) {
        e.preventDefault();
        var refto = $('#' + $(this).data('refto'));
        var post = refto.html();
        var hpid = $(this).data('hpid');

          N.json[plist.data('type')].delPostConfirm({ hpid: hpid },function(m) {
              if(m.status == 'ok') {
                  refto.html('<div style="text-align:center">' + m.message + '<br /><span id="delPostOk' + hpid +'" style="cursor:pointer">YES</span>|<span id="delPostNo'+hpid+'" style="cursor:pointer">NO</span></div>');
                  refto.on('click','#delPostOk'+hpid,function() {
                        N.json[plist.data('type')].delPost({ hpid: hpid    },function(j) {
                             if(j.status == 'ok') {
                                  refto.hide();
                             }
                             else {
                                  refto.html(j.message);
                             }
                        });
                  });

                  refto.on('click','#delPostNo'+hpid,function() {
                        refto.html(post);
                  });
             }
        });
    });

    plist.on('click',".editpost",function(e) {
       e.preventDefault();
        var refto = $('#' + $(this).data('refto')), hpid = $(this).data('hpid');

        var getF = "getPost", editF = "editPost";
        var getObj = {hpid: hpid};
        var editObj = {hpid: hpid};
        var id = hpid;
        var type = 'hpid';

        if($(this).hasClass("comment")) {
            type = 'hcid';
            getF = "getComment";
            editF = "editComment";
            var hcid =  $(this).data('hcid');
            getObj = {hcid: hcid };
            editObj = {hcid: hcid };
            id = hcid;
        }

        var form = function(fid,id,message,prev, type) {
            return  '<form style="margin-bottom:40px" id="' +fid+ '" data-hpid="'+hpid+'">' +
                        '<textarea id="'+fid+'abc" autofocus style="width:99%; height:125px">' +message+ '</textarea><br />' +
                        '<input type="submit" value="' + N.getLangData().EDIT +'" style="float: right; margin-top:5px" />' +
                        '<button type="button" style="float:right; margin-top: 5px" class="preview" data-refto="#'+fid+'abc">'+prev+'</button>'+
                        '<button type="button" style="float:left; margin-top:5px" onclick="window.open(\'/bbcode.php\')">BBCode</button>' +
                    '</form>';
        };
        N.json[plist.data('type')][getF](getObj,function(d) {
            var fid = refto.attr('id') + 'editform';
            refto.html(form(fid,id,d.message,$(".preview").html(), type));

            $('#'+fid).on('submit',function(e) {
                e.preventDefault();
                N.json[plist.data('type')][editF]($.extend(editObj, {message: $(this).children('textarea').val()}),
                        function(d) {
                            if(d.status == 'ok')
                            {
                                refto.slideToggle("slow");
                                N.html[plist.data('type')][getF](getObj, function(o) {
                                    refto.html(o);
                                    refto.slideToggle("slow");
                                    if(typeof N.getLangData().HIDE != "undefined") {
                                        $(refto.find("div.small")[0]).prepend('<a class="hide" style="float:right; margin-left:3px" data-postid="post'+id+'">'+N.getLangData().HIDE+'</a>');
                                    }

                                });
                            }
                            else {
                                alert(d.message);
                            }
                        });
            });
        });
    });

    plist.on('click',".imglocked",function() {
        var me = $(this);
        var tog = function(d) {
            if(d.status == 'ok') {
                me.attr('class','imgunlocked symbols nerdzoptions');
                me.attr('title', d.message);
            }
        };
          
          if($(this).data('silent')) { //nei commenti
              N.json[plist.data('type')].reNotifyFromUserInPost({ hpid: $(this).data('hpid'), from: $(this).data('silent') },function(d) {tog(d);});
          }
          else {
                 N.json[plist.data('type')].reNotifyForThisPost({hpid: $(this).data('hpid') },function(d) {tog(d);});
          }
    });

    plist.on('click',".imgunlocked",function() {
        var me = $(this);
        var tog = function(d) {
            if(d.status == 'ok') {
                me.attr('class','imglocked symbols nerdzoptions');
                me.attr('title',d.message);
            }
        };

        if($(this).data('silent')) {
            N.json[plist.data('type')].noNotifyFromUserInPost({ hpid: $(this).data('hpid'), from: $(this).data('silent') },function(d) {tog(d);});
        }
        else {
            N.json[plist.data('type')].noNotifyForThisPost({hpid: $(this).data('hpid') },function(d) {tog(d);});
        }
    });

    plist.on('click',".lurk",function() {
        var me = $(this);
        var tog = function(d) {
            if(d.status == 'ok') {
                me.attr('class','unlurk symbols nerdzoptions');
                me.attr('title',d.message);
            }
        };
          
          N.json[plist.data('type')].lurkPost({hpid: $(this).data('hpid') },function(d) {tog(d);});

    });

    plist.on('click',".unlurk",function() {
        var me = $(this);
        var tog = function(d) {
            if(d.status == 'ok') {
                me.attr('class','lurk symbols nerdzoptions');
                me.attr('title',d.message);
            }
        };
          
          N.json[plist.data('type')].unlurkPost({hpid: $(this).data('hpid') },function(d) {tog(d);});
    });

    plist.on('click',".bookmark",function() {
        var me = $(this);
        var tog = function(d) {
            if(d.status == 'ok') {
                me.attr('class','unbookmark symbols nerdzoptions');
                me.attr('title',d.message);
            }
        };
          
          N.json[plist.data('type')].bookmarkPost({hpid: $(this).data('hpid') },function(d) {tog(d);});

    });

    plist.on('click',".unbookmark",function() {
        var me = $(this);
        var tog = function(d) {
            if(d.status == 'ok') {
                me.attr('class','bookmark symbols nerdzoptions');
                me.attr('title',d.message);
            }
        };

        N.json[plist.data('type')].unbookmarkPost({hpid: $(this).data('hpid') },function(d) {tog(d);});
        
    });

    // EASTER EGG! :O
    // NOTE: If you alreay tried/discovered this easter egg, then feel free
    // to read the code. Otherwise don't be a bad guy and try to find it by yourself.
    if($("nav div").length) {
        var code = [ 38, 38, 40, 40, 37, 39, 37, 39, 66, 65 ], pressed = [];
        window._NERDZ_NICK = $.trim (/,(.+)/.exec ($("nav div").text())[1]);
        $(window).keydown (function dEv (e) {
            pressed.push (e.keyCode);
            while (pressed.length > code.length) pressed.shift();
            if (JSON.stringify (code) == JSON.stringify (pressed))
            {
                $(window).unbind ('keydown', dEv);
                $('body, a, textarea, input, button').css ('cursor', 'url("http://www.nerdz.eu/static/images/owned.cur"), auto');
                // okay, now the user sees a nice dick instead of its cursor. Why not
                // improve this situation a bit, like changing every nickname with random l4m0rz nicks?
                var fuckNicknames = function() {
                    $(".nerdz_from a").each (function (i, elm) {
                        if ($.inArray ($(elm).html(), ["Vincenzo", "Xenom0rph", "jorgelorenzo97", "PTKDev"]) === -1)
                            $(elm).html (["Vincenzo", "Xenom0rph", "jorgelorenzo97", "PTKDev"][Math.floor(Math.random() * 5)]);
                    });
                };
                // hook a global ajax event handler to destroy nicknames if needed
                $(document).ajaxComplete (function (evt, xhr, settings) {
                    if (/\?action=(show|profile)$|read\.html/.test (settings.url))
                        fuckNicknames();
                });
                fuckNicknames();
                // we're good to go. now do some other things
                $("#title_left a").text ("L4M3RZ");
                setTimeout (function() {
                    $("aside").hide();
                    setTimeout (function() {
                        $("article").hide();
                        $("#loadtxt").css ("text-align", "center").html ("Javascript error: Query #" + parseInt (1 + (Math.floor (Math.random() * 1000))) + " failed.<br><span style='color:#F80012;font-size:20px'>!! JS SQL Injection Detected. Shutting down !!</span>");
                        setTimeout (function() {
                            // enough fun, time for serious stuff
                            $("body").load ("/bsod.html", function() {
                                document.title = "!! SOMETHING F**KED UP !!";
                                $("*").css ("cursor", "none");
                            });
                        }, 5000);
                    }, 9500);
                }, 10500);
            }
        });
    }
    //end plist into events
    setInterval(function() {
        var nc = document.getElementById("notifycounter");
        var nt = document.getElementById("notify");
        if (nc.innerHTML !== "0" && nc.innerHTML !== "") {
            nt.style.color= "#CC0000";
        } else {
            nt.style.color= "#000";
        }
    }, 200);

    setInterval(function () { 
        var pc= document.getElementById('pmcounter');
        var pl= document.getElementById('pmlink');

        if (pc.innerHTML !== "0" && pc.innerHTML !== "") {
            pl.style.color= "#CC0000";
        } else {
            pl.style.color= "#000";
        }
        
    }, 200);
});

//URL detection, thanks to DrJest for these functions

REformat = function(str) {
  return new RegExp('(?!\\[(?:img|url|code|gist|yt|youtube|noparse)[^\\]]*?\\])' + str + '(?![^\\[]*?\\[\\/(img|url|code|gist|yt|youtube|noparse)\\])', 'gi');
};

if (!String.prototype.autoLink) {
  String.prototype.autoLink = function() {
    str = this;
    var pattern = REformat('(^|\\s+)((((ht|f)tps?:\\/\\/)|[www])([a-z\\-0-9]+\\.)*[\\-\\w]+(\\.[a-z]{2,4})+(\\/[+%:\\w\\_\\-\\?\\=\\#&\\.\\(\\)]*)*(?![a-z]))');
    urls = this.match(pattern);
    for (var i in urls) {
      if (urls[i].match(/\.(png|gif|jpg|jpeg)$/))
        str = str.replace(urls[i], '[img]' + (urls[i].match(/(^|\s+)https?:\/\//) ? '' : 'http://') + urls[i] + '[/img]');
      if (urls[i].match(/youtube\.com|https?:\/\/youtu\.be/) && !urls[i].match(/playlist/))
        str = str.replace(urls[i], '[yt]' + $.trim(urls[i]) + '[/yt]');
    }
    return str.replace(pattern, '$1[url]$2[/url]').replace(/\[(\/)?noparse\]/gi, '').replace(REformat('<3'), '\u2665');
  };
}

// End of url detection
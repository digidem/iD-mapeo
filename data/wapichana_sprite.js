var fs = require('fs');
var path = require('path');
var sprite = require('node-sprite');
var _ = require('../js/lib/lodash');

var wapichanaPath = './wapichana_icons';
var lineIcons = require('./line-icons.json');
var relationIcons = require('./relation-icons.json');

sprite.sprite('renders', { path: wapichanaPath }, function(err, wapichanaSprite) {
    if (err) process.exit(1);

    // Move image files
    fs.renameSync(path.join(wapichanaPath, wapichanaSprite.filename()), './dist/img/maki-sprite.png');

    // Generate CSS
    var template = '.feature-{name}{background-position:-{x}px -{y}px;}\n';
    var css = "/* This file is generated by make. Do NOT edit manually. */\n\n";
    css += ".preset-icon{background-image:url(img/maki-sprite.png);background-repeat:no-repeat;width:24px;height:24px;}\n";
    css += ".preset-icon-line{background-image:url(img/line-presets.png);background-repeat:no-repeat;width:60px;height:60px;}\n";
    css += ".preset-icon-relation{background-image:url(img/relation-presets.png);background-repeat:no-repeat;width:60px;height:60px;}\n";

    var images = {};

    wapichanaSprite.images.forEach(function(image) {
        var match = image.name.match(/(.*)-(12|18|24)/),
            name = image.name,
            size = 24,
            group = images[name] = images[name] || {};
            group[12] = [image.positionX, image.positionY];
            group[18] = [image.positionX, image.positionY];
            group[24] = [image.positionX, image.positionY];

        if (image.width > 1) {
            css += template.replace('{name}', image.name.replace('-24', ''))
                .replace('{x}', image.positionX)
                .replace('{y}', image.positionY);
        }
    });

    template = '.preset-icon-line.feature-{name}{background-position:-{x}px -{y}px;}\n';

    _.forEach(lineIcons, function(position, name) {
        css += template.replace('{name}', name)
            .replace('{x}', position[0])
            .replace('{y}', position[1]);

        images[name] = images[name] || {};
        images[name].line = position;
    });

    template = '.preset-icon-relation.feature-{name}{background-position:-{x}px -{y}px;}\n';

    _.forEach(relationIcons, function(position, name) {
        css += template.replace('{name}', name)
            .replace('{x}', position[0])
            .replace('{y}', position[1]);

        images[name] = images[name] || {};
        images[name].relation = position;
    });

    fs.writeFileSync('./css/feature-icons.css', css);
    fs.writeFileSync('./data/feature-icons.json', JSON.stringify(images));
});

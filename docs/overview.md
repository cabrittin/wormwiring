# wormwiring - Overview

This page provides high level documentation on the overall organization of the site.

```
.
├── apps
├── docs
├── index.html
├── LICENSE
├── pages
├── README.md
├── robots.txt
├── series
├── wormwiring.m.html
└── ww
```
## ww/
Contains config files, links to data and shared files for the site and apps.

```
ww
├── apps
│   ├── css
│   ├── images
│   └── include
├── configs
│   ├── celegans
│   └── series.json
├── image_data -> /media/barracuda3tb/image_data/
├── models -> /home/cabrittin/data/models/
└── site
    ├── backcompatible
    ├── configs
    ├── css
    ├── images
    └── include

```
## apps/
Where website applications are stored. 

```
apps
├── neuronMaps
├── neuronVolume
├── partnerList
├── synapseList
├── synapseViewer
└── template
```

## docs/
Documentation for the website.

## series/
Contains pages which provide links to download data.

## pages/
Contains pages related to the site, e.g. contact development information.

## Deprecated directories
The following directories are currently deprecated, but are kept in order to maintain backward compatibility with sites that pointed to old versions of the website. These directories have pointers to relevant pages and apps.
* data/
* maps/


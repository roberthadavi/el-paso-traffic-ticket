#!/usr/bin/env python3
"""Optimize new photos and embed location/credit metadata (EXIF GPS + XMP) into every site photo.

Usage:
  python3 scripts/photo-meta.py import SRC DEST_NAME   # resize to <=1800px, strip, save to public/images/office/
  python3 scripts/photo-meta.py tag                     # (re)write EXIF GPS + XMP on all photos in public/images/{staff,office}

Metadata source of truth: src/data/photos.json (alt/description per file). Coordinates from site.ts geo.
"""
import glob, json, os, sys
from fractions import Fraction
from PIL import Image, ImageOps
import piexif

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAT, LNG = 31.7454033, -106.2880743
CREDIT = 'El Paso Traffic Ticket Firm'
CREATOR = 'Law Office of Robert Andrew Navar Esq.'
CITY, STATE, COUNTRY, CC = 'El Paso', 'Texas', 'United States', 'US'
LOCATION = 'The Mission, 11860 Vista Del Sol Dr. #119, El Paso, TX 79936'
META = json.load(open(os.path.join(ROOT, 'src/data/photos.json')))


def dms(v):
    v = abs(v); d = int(v); m = int((v - d) * 60); s = Fraction((v - d - m / 60) * 3600).limit_denominator(10000)
    return ((d, 1), (m, 1), (s.numerator, s.denominator))


def xmp(desc, title):
    e = lambda t: t.replace('&', '&amp;').replace('<', '&lt;').replace('"', '&quot;')
    return f'''<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/" xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" xmlns:exif="http://ns.adobe.com/exif/1.0/">
<dc:title><rdf:Alt><rdf:li xml:lang="x-default">{e(title)}</rdf:li></rdf:Alt></dc:title>
<dc:description><rdf:Alt><rdf:li xml:lang="x-default">{e(desc)}</rdf:li></rdf:Alt></dc:description>
<dc:creator><rdf:Seq><rdf:li>{e(CREATOR)}</rdf:li></rdf:Seq></dc:creator>
<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">© {e(CREDIT)}</rdf:li></rdf:Alt></dc:rights>
<dc:subject><rdf:Bag><rdf:li>traffic ticket lawyer El Paso</rdf:li><rdf:li>El Paso Traffic Ticket Firm</rdf:li><rdf:li>Robert Navar attorney</rdf:li><rdf:li>El Paso TX</rdf:li></rdf:Bag></dc:subject>
<photoshop:Credit>{e(CREDIT)}</photoshop:Credit><photoshop:City>{CITY}</photoshop:City><photoshop:State>{STATE}</photoshop:State><photoshop:Country>{COUNTRY}</photoshop:Country>
<Iptc4xmpCore:Location>{e(LOCATION)}</Iptc4xmpCore:Location><Iptc4xmpCore:CountryCode>{CC}</Iptc4xmpCore:CountryCode>
<Iptc4xmpExt:LocationCreated><rdf:Bag><rdf:li rdf:parseType="Resource"><Iptc4xmpExt:Sublocation>{e(LOCATION)}</Iptc4xmpExt:Sublocation><Iptc4xmpExt:City>{CITY}</Iptc4xmpExt:City><Iptc4xmpExt:ProvinceState>{STATE}</Iptc4xmpExt:ProvinceState><Iptc4xmpExt:CountryName>{COUNTRY}</Iptc4xmpExt:CountryName><Iptc4xmpExt:CountryCode>{CC}</Iptc4xmpExt:CountryCode></rdf:li></rdf:Bag></Iptc4xmpExt:LocationCreated>
<xmpRights:WebStatement>https://elpasotrafficticket.com/</xmpRights:WebStatement><xmpRights:Marked>True</xmpRights:Marked>
<exif:GPSLatitude>{abs(LAT)},{'N' if LAT >= 0 else 'S'}</exif:GPSLatitude><exif:GPSLongitude>{abs(LNG)},{'E' if LNG >= 0 else 'W'}</exif:GPSLongitude>
</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>'''.encode('utf-8')


def exif_bytes(desc):
    zeroth = {
        piexif.ImageIFD.ImageDescription: desc.encode('utf-8'),
        piexif.ImageIFD.Artist: CREATOR.encode('utf-8'),
        piexif.ImageIFD.Copyright: f'© {CREDIT}'.encode('utf-8'),
        piexif.ImageIFD.Software: b'elpasotrafficticket.com photo-meta',
    }
    gps = {
        piexif.GPSIFD.GPSVersionID: (2, 3, 0, 0),
        piexif.GPSIFD.GPSLatitudeRef: b'N' if LAT >= 0 else b'S', piexif.GPSIFD.GPSLatitude: dms(LAT),
        piexif.GPSIFD.GPSLongitudeRef: b'E' if LNG >= 0 else b'W', piexif.GPSIFD.GPSLongitude: dms(LNG),
        piexif.GPSIFD.GPSMapDatum: b'WGS-84',
    }
    return piexif.dump({'0th': zeroth, 'Exif': {}, 'GPS': gps})


def save(im, path, desc, title):
    im.save(path, 'JPEG', quality=82, optimize=True, progressive=True, exif=exif_bytes(desc), xmp=xmp(desc, title))


def tag_all():
    for path in sorted(glob.glob(os.path.join(ROOT, 'public/images/staff/*.jpg')) + glob.glob(os.path.join(ROOT, 'public/images/office/*.jpg'))):
        name = os.path.basename(path)
        m = META.get(name)
        if not m:
            print('!! no metadata entry for', name); continue
        im = Image.open(path); im.load()
        save(im, path, m['description'], m['title'])
        print('tagged', name)


def import_one(src, dest_name):
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    im.thumbnail((1800, 1800), Image.LANCZOS)
    m = META[dest_name]
    out = os.path.join(ROOT, 'public/images/office', dest_name)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    save(im, out, m['description'], m['title'])
    print('imported', dest_name, im.size, os.path.getsize(out) // 1024, 'KB')


if __name__ == '__main__':
    if sys.argv[1] == 'tag': tag_all()
    elif sys.argv[1] == 'import': import_one(sys.argv[2], sys.argv[3])

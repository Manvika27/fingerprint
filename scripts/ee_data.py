import ee
ee.Initialize(project='fingerprint-sfc')

region = ee.Geometry.Rectangle([67.0, 25.0, 72.0, 28.5])

before = ee.ImageCollection('COPERNICUS/S1_GRD') \
    .filterDate('2022-06-01', '2022-07-15') \
    .filterBounds(region) \
    .filter(ee.Filter.eq('instrumentMode', 'IW')) \
    .filter(ee.Filter.listContains(
        'transmitterReceiverPolarisation', 'VV')) \
    .select('VV').mean()

after = ee.ImageCollection('COPERNICUS/S1_GRD') \
    .filterDate('2022-08-20', '2022-09-15') \
    .filterBounds(region) \
    .filter(ee.Filter.eq('instrumentMode', 'IW')) \
    .filter(ee.Filter.listContains(
        'transmitterReceiverPolarisation', 'VV')) \
    .select('VV').mean()

vis = {'min': -25, 'max': 0, 'palette': ['#000000', '#444441', '#888780', '#D3D1C7', '#F1EFE8']}

before_url = before.getThumbURL({
    'region': region,
    'dimensions': 1200,
    'format': 'png',
    'min': -25,
    'max': 0,
    'palette': ['000000', '444441', '888780', 'D3D1C7', 'F1EFE8']
})

after_url = after.getThumbURL({
    'region': region,
    'dimensions': 1200,
    'format': 'png',
    'min': -25,
    'max': 0,
    'palette': ['000000', '444441', '888780', 'D3D1C7', 'F1EFE8']
})

print("Before:", before_url)
print("After:", after_url)
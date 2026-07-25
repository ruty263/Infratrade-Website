import json
import pandas as pd

# Load your uploaded eBay CSV
csv_file = 'attached_assets/eBay-all-active-listings-report-2026-07-25-13316632938_1784982589257.csv'
df = pd.read_csv(csv_file, encoding='utf-8', encoding_errors='ignore')
unique_df = df.drop_duplicates(subset=['Item number']).copy()
unique_df['CSV_Row'] = unique_df.index + 2


def categorize(row):
  title = str(row['Title']).lower()
  cat1 = str(row['eBay category 1 name']).lower()

  if (
      any(
          k in title
          for k in [
              'breaker',
              'jackhammer',
              'demolition',
              'air hammer',
              'chipping hammer',
              'pavement breaker',
          ]
      )
      or 'breakers' in cat1
      or 'air hammers' in cat1
  ):
    return 'Pre-Owned Breakers & Demolition Tools'
  if any(
      k in title
      for k in ['drill', 'sds', 'impact driver', 'impact wrench', 'rotary hammer']
  ) or any(
      c in cat1 for c in ['corded drills', 'cordless drills', 'hammer drills']
  ):
    return 'Drills & Rotary Hammers'
  if any(
      k in title
      for k in [
          'vacuum',
          'dust extractor',
          'fume extractor',
          'wet & dry',
          'wet/dry',
          'vac',
          'extractor',
      ]
  ) or any(
      c in cat1
      for c in [
          'wet & dry vacuum',
          'canister & wet/dry vacuums',
          'dust extractors',
      ]
  ):
    return 'Workshop Vacuums & Dust Extraction'
  if any(
      k in title
      for k in [
          'generator',
          'transformer',
          'extension lead',
          '110v',
          '240v transformer',
          'power station',
          'distribution board',
          'cable reel',
      ]
  ) or any(c in cat1 for c in ['generators', 'power transformers']):
    return 'Site Power, Generators & Transformers'
  if any(
      k in title
      for k in [
          'heater',
          'evaporative cooler',
          'dehumidifier',
          'space heater',
          'blower fan',
          'radiator',
          'air conditioner',
          'fan heater',
          'ventilation',
      ]
  ) or any(
      c in cat1 for c in ['space heaters', 'portable evaporative coolers']
  ):
    return 'Site Heating, Cooling & Ventilation'
  if any(
      k in title
      for k in [
          'saw',
          'router',
          'grinder',
          'angle grinder',
          'cutter',
          'nibbler',
          'shear',
          'jointer',
          'planer',
          'blade',
          'nailgun',
          'nail gun',
          'stapler',
          'paslode',
      ]
  ) or any(
      c in cat1
      for c in [
          'reciprocating saws',
          'routers & jointers',
          'circular saws',
          'grinders',
          'nail guns',
      ]
  ):
    return 'Saws, Cutting & Fastening Tools'
  if any(
      k in title
      for k in [
          'hoist',
          'winch',
          'crane',
          'harness',
          'lifting',
          'pallet truck',
          'trolley',
          'shackle',
          'slings',
          'strop',
          'ratchet strap',
          'ladder',
          'trestle',
          'scaffold',
          'step ladder',
      ]
  ) or any(c in cat1 for c in ['cranes & hoists', 'safety harnesses', 'ladders']):
    return 'Lifting, Access & Site Handling'
  if any(
      k in title
      for k in [
          'pressure washer',
          'water pump',
          'submersible pump',
          'power washer',
          'jet wash',
          'drain pump',
      ]
  ) or any(c in cat1 for c in ['electric pressure washers', 'water pumps']):
    return 'Pressure Washers & Water Pumps'
  if any(
      k in title
      for k in [
          'mower',
          'lawnmower',
          'hedge trimmer',
          'strimmer',
          'chainsaw',
          'scarifier',
          'tiller',
          'cultivator',
          'rotavator',
          'turf',
      ]
  ) or any(c in cat1 for c in ['lawn mowers', 'outdoor power equipment']):
    return 'Outdoor & Garden Machinery'
  if any(
      k in title
      for k in [
          'torch',
          'work light',
          'light',
          'meter',
          'detector',
          'tool',
          'socket',
          'wrench',
          'spanner',
          'pliers',
          'screwdriver',
          'vice',
          'clamp',
          'welder',
          'soldering',
          'compressor',
          'air tool',
          'laser',
          'level',
          'guage',
          'gauge',
      ]
  ) or any(
      c in cat1
      for c in [
          'torches & work lights',
          'construction tools',
          'industrial tools',
          'diy tools',
          'test meters',
      ]
  ):
    return 'Workshop Tools, Lighting & Test Gear'
  if any(
      k in title
      for k in [
          'filter',
          'transit',
          'ford',
          'car',
          'van',
          'truck',
          'lorry',
          'mirror',
          'hinge',
          'belt',
          'timing',
          'joint',
          'arm',
          'wiper',
          'brake',
          'engine',
          'oil',
          'cabin',
          'pollen',
          'clutch',
          'suspension',
          'bumper',
      ]
  ) or any(
      c in cat1
      for c in [
          'car parts',
          'truck parts',
          'air filters',
          'fuel filters',
          'pollen filters',
          'wiper blades',
          'timing kits',
          'pulleys',
          'doors',
          'control arms',
          'mirror glass',
      ]
  ):
    return 'Vehicle, Van & Plant Spare Parts'
  return 'Clearance & General Clearance Items'


unique_df['Website Category'] = unique_df.apply(categorize, axis=1)

replit_data = []
for _, r in unique_df.iterrows():
  replit_data.append({
      'csv_row': int(r['CSV_Row']),
      'item_id': str(r['Item number']),
      'title': str(r['Title']),
      'category': str(r['Website Category']),
      'price': float(r['Start price']) if pd.notnull(r['Start price']) else 0.0,
      'ebay_category': str(r['eBay category 1 name']),
  })

with open('inventory_categories.json', 'w', encoding='utf-8') as f:
  json.dump(replit_data, f, indent=2)

print(
    "SUCCESS! Created 'inventory_categories.json' with all",
    len(replit_data),
    'items.',
)

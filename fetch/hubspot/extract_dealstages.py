import json

input_path = 'fetch/hubspot/properties-reference.json'
output_path = 'fetch/hubspot/dealstages_names_labels.txt'

with open(input_path, 'r') as f:
    data = json.load(f)

results = data.get('results', [])

with open(output_path, 'w') as out:
    for obj in results:
        if obj.get('groupName') == 'dealstages':
            name = obj.get('name', '')
            label = obj.get('label', '')
            out.write(f"{name}\t{label}\n")

print(f"Done. Output written to {output_path}")

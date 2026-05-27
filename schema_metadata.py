# schema_metadata.py

SCHEMA_INFO = {
    "gov_building": {
        "description": "Government GIS building dataset",
        "columns": {
            "gb_id": "Unique building ID",
            "state_name": "State name",
            "dist_name": "District name",
            "block_name": "Administrative block",
            "tehsil_name": "Tehsil name",
            "gram_panchayat_name": "Gram panchayat",
            "village_name": "Village name",
            "type_building": "Building category",
            "name_building": "Office/building name",
            "year_comm": "Establishment year",
            "lat": "Latitude coordinate",
            "long": "Longitude coordinate",
            "ownership": "Ownership type",
            "floors": "Number of floors",
            "height": "Building height",
            "is_shared": "Whether building is shared",
            "use_of_building": "Usage type",
            "pincode": "Postal code",
            "address": "Building address",
            "uid": "Internal unique identifier",
            "floors_covered_by_office": "Floors occupied",
            "sitting_floor": "Office sitting floor",
            "geom": "PostGIS geometry point",
            "area_type": "Urban or rural",
            "created_at": "Creation timestamp",
            "updated_at": "Last update timestamp",
            "physical_condition": "Building physical condition"
        }
    }
}
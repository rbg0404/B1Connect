import json
import os
from pathlib import Path

class Config:
    def __init__(self):
        config_path = Path(__file__).parent.parent / 'config.json'
        with open(config_path, 'r') as f:
            self.data = json.load(f)
    
    @property
    def service_layer_url(self):
        return self.data.get('ServiceLayerURL')
    
    @property
    def databases(self):
        return self.data.get('Databases', [])
    
    @property
    def default_user(self):
        return self.data.get('DefaultUser')
    
    @property
    def default_password(self):
        return self.data.get('DefaultPassword')
    
    def get_databases_list(self):
        return [
            {
                'name': db['Database'],
                'description': db['Name'],
                'environment': 'HANA' if db['Type'] == 'HANADB' else 'MSSQL' if 'MSSQL' in db['Type'] else 'UNKNOWN'
            }
            for db in self.databases
        ]

config = Config()

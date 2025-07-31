from flask import Flask
from sub_main_py.index import index_bp
from sub_main_py.distributor import distributor_bp
from sub_main_py.admin import admin_bp
from sub_main_py.add_edit_product import add_edit_product_bp
from sub_main_py.forgotpasswordpage import forgotpassword_bp


app = Flask(__name__)
app.secret_key = "123456789789456123"

# Register Blueprints
app.register_blueprint(index_bp)
app.register_blueprint(distributor_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(add_edit_product_bp)
app.register_blueprint(forgotpassword_bp)




if __name__ == "__main__":
    app.run(debug=True,host="0.0.0.0",port="50959")

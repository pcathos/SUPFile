package com.subfile.pan.myapplication;

import android.content.Intent;
import android.os.Build;
import android.support.annotation.RequiresApi;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import com.android.volley.RequestQueue;
import com.android.volley.Response;

import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;


public class MainActivity extends AppCompatActivity {
    private EditText mlog;
    private EditText mpass;
    private Button login;
    private String username;
    private String password;
    private TextView aa;
    private Button res;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mlog=(EditText) findViewById(R.id.login_id);
        mpass=(EditText) findViewById(R.id.login_password);
        login=(Button) findViewById(R.id.login_button);
        aa=(TextView)findViewById(R.id.textView);
        res=(Button)findViewById(R.id.res_button) ;

        login.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                username=mlog.getText().toString();
                password=mpass.getText().toString();
                data.user1.setUsername(username);
                data.user1.setPassword(password);
                RequestQueue requestQueue = Volley.newRequestQueue(getApplicationContext());

                String url = data.ip+"/login/login?username="+username+"&password="+password;

                HashMap<String, String> map = new HashMap<String,String>();

                CustomRequest  req=new CustomRequest(url,map,new Response.Listener<JSONObject>() {
                    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
                    @Override
                    public void onResponse(JSONObject jsonObject) {
                        try {
                            if(jsonObject.getInt("ok")==1){
                                String xx=jsonObject.getString("userData");
                                String yy=jsonObject.getString("memorydata");
                                JSONArray jsonArray=new JSONArray(xx);
                                JSONArray jsonArray1=new JSONArray(yy);
                                data.user1.setUsername(jsonArray.getJSONObject(0).getString("username"));
                                data.usedmemory=jsonArray1.getJSONObject(0).getInt("used_memory");
                                mlog.setText("");
                                mpass.setText("");
                                aa.setText("login success");
                                Intent i = new Intent(MainActivity.this,Main2Activity.class);
                                startActivity(i);
                            }else {
                                aa.setText("login fail");
                            }


                        } catch (JSONException e) {
                            e.printStackTrace();
                            //aa.setText("connect fail");
                            aa.setText(e.toString());
                        }
                    }
                },new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError volleyError) {
                        Log.i("wangshu", volleyError.getMessage(), volleyError);
                        aa.setText(volleyError.toString());
                    }
                });
                requestQueue.add(req);
            }
        });
        res.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                //data.fileList=getlist();
                Intent intent = new Intent(MainActivity.this,Main3Activity.class);
                startActivity(intent);
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }


}

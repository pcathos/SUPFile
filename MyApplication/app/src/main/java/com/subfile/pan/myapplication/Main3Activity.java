package com.subfile.pan.myapplication;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

public class Main3Activity extends AppCompatActivity {
    private EditText mlog;
    private EditText mpass;
    private EditText mpass2;
    private EditText lmailbox;
    private String username;
    private String password;
    private String password2;
    private String mailbox;
    private TextView aa;
    private Button res;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main3);
        mlog=(EditText) findViewById(R.id.login_id);
        mpass=(EditText) findViewById(R.id.login_password);
        mpass2=(EditText) findViewById(R.id.login_password2);
        lmailbox=(EditText)findViewById(R.id.login_mailbox);
        aa=(TextView)findViewById(R.id.textView);
        res=(Button)findViewById(R.id.res_button);
        res.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                username=mlog.getText().toString();
                password=mpass.getText().toString();
                password2=mpass2.getText().toString();
                mailbox=lmailbox.getText().toString();
                if (password.equals(password2)){
                    //aa.setText("密码相同");
                    RequestQueue requestQueue = Volley.newRequestQueue(getApplicationContext());
                    String url = data.ip+"/login/res?username="+username+"&password="+password+"&mailbox="+mailbox+"&used_memory=0&max_memory=52428800";
                    //aa.setText(url);
                    HashMap<String, String> map = new HashMap<String,String>();
                    CustomRequest  req=new CustomRequest(url,map,new Response.Listener<JSONObject>(){
                        @Override
                        public void onResponse(JSONObject jsonObject) {
                            try {
                                if(jsonObject.getInt("ok")==1){
                                    aa.setText("register suceess");
                                    Intent i = new Intent(Main3Activity.this,MainActivity.class);
                                    startActivity(i);
                                }else {
                                    aa.append(jsonObject.getString("msg"));
                                }
                            } catch (JSONException e) {
                                e.printStackTrace();
                                aa.append("register fail");
                            }
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError volleyError) {
                            aa.setText(volleyError.toString());
                        }
                    });
                    requestQueue.add(req);
                }else {
                    aa.setText("secret different");
                }
            }
        });
    }
}

package com.subfile.pan.myapplication;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

public class Main5Activity extends AppCompatActivity {
    private TextView newName;
    private Button rename_button;
    private Button return_button;
    private String newname;
    private TextView aa;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main5);
        newName=findViewById(R.id.new_name);
        rename_button=findViewById(R.id.rename_button);
        return_button=findViewById(R.id.return_button);
        aa=findViewById(R.id.textView);
        rename_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                newname=newName.getText().toString()+data.fileList.get(data.id).getTypeis();
                RequestQueue requestQueue = Volley.newRequestQueue(getApplicationContext());
                String url = data.ip + "/login/rename?username=" + data.user1.getUsername() + "&password=" + data.user1.getPassword() + "&hashName=" + data.fileList.get(data.id).getHashname()+"&newName="+newname;
                StringRequest request = new StringRequest(url, new Response.Listener<String>() {
                    @Override
                    public void onResponse(String s) {
                        aa.setText("rename success");
                        Intent i = new Intent(Main5Activity.this,Main2Activity.class);
                        startActivity(i);
                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError volleyError) {
                        aa.setText("rename fail");
                    }
                });
                requestQueue.add(request);
            }
        });
        return_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(Main5Activity.this,Main4Activity.class);
                startActivity(i);
            }
        });
    }

}
package com.subfile.pan.myapplication;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.design.widget.BottomNavigationView;
import android.support.v7.app.AppCompatActivity;
import android.text.TextUtils;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.apache.http.client.HttpClient;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class Main2Activity extends AppCompatActivity {

    //private TextView mTextMessage;
    private List<String> data1 = new ArrayList<String>();
    private TextView aa;
    private LinearLayout bb;
    private LinearLayout vv;
    private Button logout;
    private ListView listView;
    private Button path_button;
    private TextView path_view;
    private Button upload;
    private Uri uri1;
    private BottomNavigationView.OnNavigationItemSelectedListener mOnNavigationItemSelectedListener
            = new BottomNavigationView.OnNavigationItemSelectedListener() {
        @Override
        public boolean onNavigationItemSelected(@NonNull MenuItem item) {
            switch (item.getItemId()) {
                case R.id.navigation_home:
                    bb.setVisibility(View.GONE);
                    vv.setVisibility(View.GONE);
                    listView.setVisibility(View.VISIBLE);
                    return true;
                case R.id.navigation_dashboard:
                    bb.setVisibility(View.GONE);
                    vv.setVisibility(View.VISIBLE);
                    listView.setVisibility(View.GONE);
                    return true;
                case R.id.navigation_notifications:
                    bb.setVisibility(View.VISIBLE);
                    vv.setVisibility(View.GONE);
                    listView.setVisibility(View.GONE);
                    return true;
            }
            return false;
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main2);
        listView = (ListView) findViewById(R.id.list_view);
        bb=findViewById(R.id.bbb);
        logout=findViewById(R.id.logout_button);
        vv=findViewById(R.id.vvv);
        BottomNavigationView navigation = (BottomNavigationView) findViewById(R.id.navigation);
        navigation.setOnNavigationItemSelectedListener(mOnNavigationItemSelectedListener);

        path_button=findViewById(R.id.selset_file);
        path_view=findViewById(R.id.path_view);
        upload=findViewById(R.id.upload);

        aa=(TextView)findViewById(R.id.textView);
        data.fileList=new ArrayList<>();

        RequestQueue requestQueue = Volley.newRequestQueue(getApplicationContext());
        String url = data.ip+"/api/showfile?username="+data.user1.getUsername()+"&password="+data.user1.getPassword();
        aa.setText("welcome  "+data.user1.getUsername()+"\n Space:"+data.usedmemory/1024/1024+"M"+"/50M");

        logout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(Main2Activity.this,MainActivity.class);
                startActivity(i);
            }
        });


        StringRequest request=new StringRequest(url, new Response.Listener<String>() {
            @Override
            public void onResponse(String s) {
                String ff = null;
                try {
                    JSONObject ss=new JSONObject(s);
                    ff=ss.getString("file");
                } catch (JSONException e) {
                    e.printStackTrace();
                }

                try {
                    JSONArray jsonArray=new JSONArray(ff);
                    for (int i=0;i<jsonArray.length();i++){
                        JSONObject jsonObject = jsonArray.getJSONObject(i);
                        file a=new file();
                        a.setFilename(jsonObject.getString("fileName"));
                        a.setHashname(jsonObject.getString("hashName"));
                        a.setDownloadtime(jsonObject.getString("downloadTime"));
                        a.setLasttime(jsonObject.getString("lastTime"));
                        a.setSize(jsonObject.getString("size"));
                        a.setTypeis(jsonObject.getString("typeis"));
                        data.fileList.add(a);
                    }
                    for (int i=0;i<data.fileList.size();i++){
                        data1.add(data.fileList.get(i).getFilename());
                    }
                    ArrayAdapter<String> adapter = new ArrayAdapter<String>(Main2Activity.this, android.R.layout.simple_list_item_1, data1);

                    listView.setAdapter(adapter);

                    listView.setOnItemClickListener(new OnItemClickListener(){

                        @Override
                        public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
                            data.id=(int) l;
                            Intent x = new Intent(Main2Activity.this,Main4Activity.class);
                            startActivity(x);
                        }
                    });

                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError volleyError) {
                aa.setText(volleyError.toString());
            }
        });
        requestQueue.add(request);

        path_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.setType("*/*");
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                startActivityForResult(intent,1);
            }
        });
        upload.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                ArrayList<File> files=new ArrayList<>();
                ArrayList<String> names=new ArrayList<>();
                ArrayList<Object> values=new ArrayList<>();
                files.add(new File(String.valueOf(uri1)));
//添加数据
                boolean state=UploadUtils.uploadFile(files,null,data.ip+"/login/uploadFiles", names, values);
            }
        });
    }

    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == 1) {
                uri1 = data.getData();
                //Toast.makeText(this, "文件路径："+uri.getPath().toString(), Toast.LENGTH_SHORT).show();
                path_view.setText(uri1.getPath().toString());
            }
        }
    }

}

package com.subfile.pan.myapplication;

import android.Manifest;
import android.app.DownloadManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Environment;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import java.io.File;
import java.text.DecimalFormat;
import java.text.NumberFormat;

public class Main4Activity extends AppCompatActivity {
    private TextView file_info;
    private Button return_button;
    private Button delete_button;
    private Button rename_button;
    private Button download_button;
    private Button show;
    private Button share_button;
    private TextView aa;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main4);
        file_info = findViewById(R.id.file_info);
        return_button = findViewById(R.id.return_button);
        delete_button = findViewById(R.id.delete_button);
        return_button=findViewById(R.id.return_button);
        rename_button=findViewById(R.id.rename_button);
        download_button=findViewById(R.id.download_button);
        share_button=findViewById(R.id.share_button);
        aa = findViewById(R.id.textView);
        show=findViewById(R.id.show);
        NumberFormat nf = new DecimalFormat("##.##");
        file_info.setText("File Name :" + data.fileList.get(data.id).getFilename() + "\nSize :" +  nf.format(Double.valueOf((data.fileList.get(data.id).getSize()))/1024/1024) +"MB"+"\nLast change time ：" + data.fileList.get(data.id).getLasttime() + "\nDownload time :" + data.fileList.get(data.id).getDownloadtime()
        );

        share_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                String sharelink = data.ip + "/share.html?shareFile="+data.fileList.get(data.id).getHashname();
                ClipData clipData = ClipData.newPlainText("share",sharelink);
                cm.setPrimaryClip(clipData);
                Toast.makeText(Main4Activity.this, "You can paste link to share !", Toast.LENGTH_LONG).show();
            }
        });






        return_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(Main4Activity.this, Main2Activity.class);
                startActivity(i);
            }
        });
        delete_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                RequestQueue requestQueue = Volley.newRequestQueue(getApplicationContext());
                String url = data.ip + "/login/removeFile?username=" + data.user1.getUsername() + "&password=" + data.user1.getPassword() + "&hashName=" + data.fileList.get(data.id).getHashname();
                StringRequest request = new StringRequest(url, new Response.Listener<String>() {
                    @Override
                    public void onResponse(String s) {
                        aa.setText("delete success");
                        Intent i = new Intent(Main4Activity.this, Main2Activity.class);
                        startActivity(i);
                    }
                }, new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError volleyError) {
                        aa.setText("delete fail");
                    }
                });
                requestQueue.add(request);

            }
        });

        rename_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(Main4Activity.this, Main5Activity.class);
                startActivity(i);
            }
        });

        show.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent=new Intent();
                intent.setAction(Intent.ACTION_VIEW);
                intent.addCategory(Intent.CATEGORY_BROWSABLE);
                intent.setData(Uri.parse(data.ip+"/allFiles/"+data.fileList.get(data.id).getHashname()));
                startActivity(intent);
            }
        });


        download_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                aa.setText("ffff");
                int hasReadExternalStoragePermission = ContextCompat.checkSelfPermission(getApplication(),Manifest.permission.WRITE_EXTERNAL_STORAGE);
                //Log.e("PERMISION_CODE",hasReadExternalStoragePermission+"***");
                if(hasReadExternalStoragePermission== PackageManager.PERMISSION_GRANTED){
                    download();
                    aa.setText("bbbb");
                }else{
                    //若没有授权，会弹出一个对话框（这个对话框是系统的，开发者不能自己定制），用户选择是否授权应用使用系统权限
                    ActivityCompat.requestPermissions(Main4Activity.this,new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},1);
                    aa.setText("Didn't get permission");
                }
            }
        });
    }
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if(requestCode==1){
            if(permissions[0].equals(Manifest.permission.WRITE_EXTERNAL_STORAGE)&&grantResults[0]==PackageManager.PERMISSION_GRANTED){
                //用户同意授权，执行读取文件的代码

                download();
            }else{
                //若用户不同意授权，直接暴力退出应用。
                // 当然，这里也可以有比较温柔的操作。

                finish();
            }
        }
    }
    public void download(){
        String uri=data.ip+"/allFiles/"+data.fileList.get(data.id).getHashname();
        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(uri));
        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        request.setTitle(data.fileList.get(data.id).getFilename());
        request.setDescription("对于该请求文件的描述");
        File saveFile = new File(Environment.getExternalStorageDirectory(), data.fileList.get(data.id).getFilename());
        request.setDestinationUri(Uri.fromFile(saveFile));
        DownloadManager manager = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
        long downloadId = manager.enqueue(request);
    }
}

package com.subfile.pan.myapplication;

/**
 * Created by 21074 on 2018/6/1.
 */

public class file {
    private String filename;
    private String hashname;
    private String lasttime;
    private String size;
    private String downloadtime;
    private String typeis;

    public file(String filename, String hashname, String lasttime, String size, String downloadtime, String typeis) {
        this.filename = filename;
        this.hashname = hashname;
        this.lasttime = lasttime;
        this.size = size;
        this.downloadtime = downloadtime;
        this.typeis = typeis;
    }

    public file() {

    }

    public String getFilename() {
        return filename;
    }

    public String getHashname() {
        return hashname;
    }

    public String getLasttime() {
        return lasttime;
    }

    public String getSize() {
        return size;
    }

    public String getDownloadtime() {
        return downloadtime;
    }

    public String getTypeis() {
        return typeis;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public void setHashname(String hashname) {
        this.hashname = hashname;
    }

    public void setLasttime(String lasttime) {
        this.lasttime = lasttime;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public void setDownloadtime(String downloadtime) {
        this.downloadtime = downloadtime;
    }

    public void setTypeis(String typeis) {
        this.typeis = typeis;
    }
}

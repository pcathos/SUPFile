const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const Multer = require('multer');
const ejs = require('ejs');
const mammoth =  require('mammoth');
const nodemailer = require('nodemailer');
// const ppt2pdf = require('ppt2pdf');

const server = express();

const loginRouter = express.Router();
const apiRouter = express.Router();
const shareRouter = express.Router();
const checkRouter = express.Router();

const databasePool = require('./SUPFile/js/config_sql.js')
const appport = require('./SUPFile/js/app_port.js')
const host = require('./SUPFile/js/app_host.js')
const storepath = require('./SUPFile/js/app_storepath.js')
const hostandport = host+":"+appport

server.listen(appport);
//multer 存储位置
server.use(Multer({dest:storepath}).any());
server.use('/login',loginRouter);
server.use('/api',apiRouter);
server.use('/share',shareRouter);

//share link
server.use('/share.html',(req,res)=>{
	// res.send({hashName:req.query.hashName});
	if(req.query.page == undefined || req.query.page == 0){
		var page = 0
	}
	else{
		var page = req.query.page;
	}
	databasePool.getConnection((err,connection)=>{
		if(err){
			console.log(err);
			res.send({'ok':0,'msg':'Database connection failed'});
			//c.end();
		}
		else{	
			connection.query('SELECT * FROM `allFiles` WHERE hashName = "'+req.query.shareFile+'";',(err,data)=>{
				if(err){
					console.log(err);
					res.send({ok:0,data:'Database connection failed'});
				}
				else{
					data = data.reverse();
					var newData = data.slice(page*10,page*10+10);

					console.log(newData)
					ejs.renderFile('./SUPFile/show.ejs',{allData:newData,page:page},function(err,data){
							res.send(data);
						//console.log(data)
					});
					//res.send({ok:1,data:data})
				};
				connection.end();
			})
		}
	})
})


//check link
server.use('/check.html',(req,res)=>{
	// res.send({hashName:req.query.hashName});
	if(req.query.page == undefined || req.query.page == 0){
		var page = 0
	}
	else{
		var page = req.query.page;
	}
	databasePool.getConnection((err,connection)=>{
		if(err){
			console.log(err);
			res.send({'ok':0,'msg':'Database connection failed'});
			//c.end();
		}
		else{
			connection.query('SELECT code FROM `user_table` WHERE username="'+req.query.username+'" ',(err,data)=>{
				if(err){
					console.log(err);
					res.send({ok:0,data:'连接失败'});
					connection.end();
				}
				else{
					console.log(data[0].code);
					if(data[0].code == req.query.code){
						console.log(data[0].code);
						console.log(req.query.code);
						console.log("666");
						connection.query('UPDATE `user_table` SET `active` ="1" WHERE username ="'+req.query.username+'"',(err,data)=>{
							if(err){
								console.log(err);
								res.send({ok:0,data:'连接失败'});
							}
							else{
								ejs.renderFile('./SUPFile/check.ejs',{page:page},function(err,data){
									
										res.send(data);
									
									//console.log(data)
								});
								//res.send({ok:1,data:data})
							};
							connection.end();
						})
					}
					
				}
			});
		
		}


	})


})

//////////////////////////////////////   share page   ////////////////////////////////////////////////////////

shareRouter.use('/sharefile',(req,res)=>{
	databasePool.getConnection((err,connection) =>{
		if(err){
			console.log(err);
			res.send({'ok':0,'msg':'Fail connection'});
		}
		else{
			connection.query('SELECT * FROM `allFiles` WHERE hashName = "'+req.query.hashName+'" ;',(err,data)=>{
				if (err) {
					console.log(err);
			        res.send({'ok':0,'msg':'The file does not exist or is damaged'});
				}
				else{
					console.log(data[0]);
					res.send({'ok':1,'msg':' Connection success','data':data});
				}
				connection.end();
				
				
			});
		
		}
	});
})
/////////////////////////////////////   index   /////////////////////////////////////////////////////////////
// //ppt2pdf
// loginRouter.use('/ppt2pdf',(req,res)=>{
// 	ppt2pdf.convet("./SUPFile/allFiles/"+req.query.hashName, null,function(err,result){
// 		if (error) console.log(error);
//   		else console.log(result);
// 	})
// })


//docx2html
loginRouter.use('/docx2html',(req,res)=>{
	var href = "./SUPFile/allFiles/" +req.query.docxhash
	mammoth.convertToHtml({path:href})
    .then(function(result){
        var html = result.value; // The generated HTML
        res.send({ok:1,convertResult:html});
    })
    .done();
});

//add downloadTime
loginRouter.use('/addDownload',(req,res)=>{
	// console.log(req.query.username);
	databasePool.getConnection((err,connection)=>{
		if (err) {
			console.log(err);
			res.send({ok:0,msg:'Failed connection'});
			connection.end();
		}
		else{
			connection.query('SELECT downloadTime FROM `allFiles` WHERE hashName = "'+req.query.hashName+'" AND fileOwner="'+req.query.username+'";',(err,data)=>{
				if (err) {
					console.log(err);
					res.send({ok:0,msg:'Failed connection'});
					connection.end();
				}
				else{
					var downloadTimer = Number(data[0].downloadTime)+1;
					connection.query('UPDATE `allFiles` SET downloadTime="'+downloadTimer+'" WHERE hashName = "'+req.query.hashName+'" AND fileOwner="'+req.query.username+'";',(err,data)=>{
						if (err) {
							console.log(err);
							res.send({ok:0,msg:'Failed connection'});
							connection.end();
						}
						else{
							connection.query('UPDATE `'+req.query.username+'` SET downloadTime="'+downloadTimer+'" WHERE hashName = "'+req.query.hashName+'";',(err,data)=>{
								if (err) {
									console.log(err);
									res.send({ok:0,msg:'Failed connection'});
									connection.end();
								}
								else{
									res.send({ok:1,msg:'Download success'});
								}
								connection.end();
							})
						}
					})
				}
			})
		}
	})
});

//delete file
//fs有啥用
loginRouter.use('/removeFile',(req,res)=>{
	fs.unlink('./SUPFile/allFiles/'+req.query.hashName,(err)=>{
		if (err) {
			console.log(err);
			res.send({ok:0,msg:'Delete file failed'});
		}
		else{
			databasePool.getConnection((err,connection)=>{
				if (err) {
					console.log(err);
					res.send({ok:0,msg:'Delete file failed'});
				}
				else{
					//先减内存试试
					console.log("准备改内存");
					connection.query('SELECT used_memory FROM `user_table` WHERE username = "'+req.query.username+'"',(err,data)=>{
						if(err){
							console.log(err);
							res.send({ok:0,msg:'Delect  memory failed'});
							connection.end();
						}
						else{
							var used_memory_old = data;
							connection.query('SELECT size FROM `allFiles` WHERE hashName="'+req.query.hashName+'"',(err,data)=>{
								if(err){
									console.log(err);
									res.send({ok:0,msg:'Select  size failed'});
									connection.end();
								}
								else{
								    var used_memory_new  = Number(used_memory_old[0].used_memory)- Number(data[0].size);
									console.log(used_memory_old);
									console.log(data[0].size);
									console.log(used_memory_new);
									connection.query('UPDATE `user_table` SET `used_memory` = "'+used_memory_new+'" WHERE username ="'+req.query.username+'"',(err,data)=>{
										if (err) {
											console.log(err);
											res.send({ok:0,msg:'Update used_memory failed'});
											connection.end();
										}
                                        else{
                                        	connection.query('DELETE FROM `'+req.query.username+'` WHERE hashName="'+req.query.hashName+'";',(err,data)=>{
												if (err) {
													console.log(err);
													res.send({ok:0,msg:'Delete file failed'});
													connection.end();
												}
												else{
													connection.query('DELETE FROM `allFiles` WHERE hashName="'+req.query.hashName+'" AND fileOwner="'+req.query.username+'";',(err,data)=>{
														if (err) {
															console.log(err);
															res.send({ok:0,msg:'Delete files from allfiles failed'});
														}
														else{
                                                            console.log(used_memory_new);
															res.send({ok:1,msg:'Delete file success',data:used_memory_new});
														}
														connection.end();
													})
													
												}
												
											});
                                        }
									});
								}
							});
						}

					});
					
				}
			})

		}
	})
});


//Upload File
loginRouter.use('/uploadFiles',(req,res)=>{
	console.log(req.files)
	//log里面可以查看originalname等,此处可用于改名
	var newName = req.files[0].path + path.parse(req.files[0].originalname).ext;
	var hashName = req.files[0].filename + path.parse(req.files[0].originalname).ext;
	var thisTime = new Date().toLocaleDateString()+' '+new Date().toLocaleTimeString();
	var typeis = path.parse(req.files[0].originalname).ext;
	fs.rename(req.files[0].path, newName, (err)=>{
		if (err) {
			console.log(err);
		}
		else{
			databasePool.getConnection((err,connection)=>{
				if (err) {
					console.log(err);
					res.send({'ok':0,'msg':'Fail connection'});
					connection.end();
				}
				else{
					//向个人数据库表中添加一行
					connection.query('INSERT INTO `'+req.body.fileOwner+'`(`fileName`,`hashName`,`lastTime`,`typeis`,`size`,`downloadTime`) VALUES("'+req.files[0].originalname+'","'+hashName+'","'+thisTime+'","'+path.parse(req.files[0].originalname).ext+'","'+req.files[0].size+'","0");',(err,data)=>{
						if (err) {
							console.log(err); 
							res.send({'ok':0,'msg':'Filed Save'});
							connection.end();
						}
						else{
							connection.query('INSERT INTO `allFiles`(`fileName`,`hashName`,`lastTime`,`typeis`,`size`,`downloadTime`,`fileOwner`) VALUES("'+req.files[0].originalname+'","'+hashName+'","'+thisTime+'","'+path.parse(req.files[0].originalname).ext+'","'+req.files[0].size+'","0","'+req.body.fileOwner+'");',(err,data)=>{
								if (err) {
									console.log(err);
									res.send({'ok':0,'msg':'Filed Save to all file'});
								}
								else{
									//更新用户表内存
                                    connection.query('SELECT used_memory,max_memory FROM `user_table` WHERE username = "'+req.body.fileOwner+'"',(err,data)=>{
                                        	if (err) {
                                        		console.log(err);
                                        		res.send({ 'ok':0,'msg':'Filed SELECT memory'});
                                        		connection.end();
                                        	}
                                        	else{

                                        		console.log(req.files[0].size);
                                        		var used_memory_last = Number (data[0].used_memory)+ Number (req.files[0].size);
                                        		console.log(data[0].max_memory);
                                        		let max=Number (data[0].max_memory);
                                        		console.log(max);
                                        		console.log(used_memory_last);
                                        	    connection.query('UPDATE `user_table` SET `used_memory` = "'+used_memory_last+'" WHERE username ="'+req.body.fileOwner+'"',(err,data)=>{
										    	if (err) {
												console.log(err);
												res.send({'ok':0,'msg':'Filed Save to user_table'});
												} 
												else{
													console.log(used_memory_last);
													res.send({'ok':1,'msg':'Upload success',hashName:hashName,timer:thisTime,typeis:typeis,used_memory_last:used_memory_last,max_memory:max});

												}
									    		})
                                        	}
                                        });

									
								}
								connection.end();
							})
							
						}
						
					})
				}
			})
		}
	});
});

//register
loginRouter.use('/res',(req,res)=>{
	//console.log(req.query);
	databasePool.getConnection((err,connection)=>{
		if (err) {
			console.log(err);
			res.send({'ok':0,'msg':'Fail connection'});
		}
		else{
			connection.query('SELECT username FROM `user_table` WHERE BINARY username="'+req.query.username+'";',(err,data)=>{
				if(err) {
					console.log(err);
					res.send({'ok':0,'msg':'Fail connection'});
					connection.end();
				}	
				else{
					//判断用户是否存在
					if(data.length>0) {
						res.send({'ok':0,'msg':'User exist'});
						connection.end();
					}
					else{
						//check email
						connection.query('SELECT mailbox FROM `user_table` WHERE BINARY mailbox="'+req.query.mailbox+'";',(err,data)=>{
							if(data.length>0) {
								res.send({'ok':0,'msg':'Mail exist'});
								connection.end();
							}
							else{
								var code=Math.random().toString(36).substr(2);
								  console.log(code);
								  var smtpTransport=require('nodemailer-smtp-transport');
									var transporter = nodemailer.createTransport(smtpTransport({
									  	host: 'smtp.mxhichina.com',
								        port: 465,
								        //secure: true, // true for 465, false for other ports
								        auth: {
								            user: 'service@supfile.store', // generated ethereal user
								            pass: 'Service185788688'  // generated ethereal password
								        }
									 }));
									console.log(req.query.mailbox);
									  var mailOptions = {
									    from: 'service@supfile.store', // 发送者
									    to:req.query.mailbox, // 接受者,可以同时发送多个,以逗号隔开
									    subject: 'SUPFile account active', // 标题
									    text:`Dear ${req.query.username}, \n please follow this link to active your account
									    ${hostandport}/check.html?username=${req.query.username}&code=${code}`
									  };

									  transporter.sendMail(mailOptions, function (err, info) {
									    if (err) {
									      console.log(err);
									      return;
									    }

									    console.log('发送成功');
									  });

						//user_table里面创建用户
						connection.query('INSERT INTO `user_table` (`username`,`password`,`used_memory`,`max_memory`,`mailbox`,`code`,`active`) VALUES("'+req.query.username+'","'+req.query.password+'","'+req.query.used_memory+'","'+req.query.max_memory+'","'+req.query.mailbox+'","'+code+'","0");',(err,data)=>{
							if (err) {
								console.log(err);
								res.send({'ok':0,'msg':'Fail connection'});
								connection.end();
							}
							else{

								
								//为用户创建个人表
								//纯数字表不能创建,不能带特殊符号
								connection.query(`CREATE TABLE ${req.query.username} 
										(
										ID int(255) NOT NULL AUTO_INCREMENT,
										fileName varchar(255) NOT NULL,
										hashName varchar(255) NOT NULL,
										lastTime varchar(255) NOT NULL,
										typeis varchar(255),
										size varchar(255) NOT NULL,
										downloadTime varchar(255) NOT NULL,
										PRIMARY KEY (ID)
									)`,(err,data)=>{
										if (err) {
											console.log(err);
										}
										else{
											res.send({'ok':1,'msg':'Create user success'});
										};
										connection.end();
									})
								}
								
								});
							}
						})
							  
					}
				}
			});
		}
	});
});

//login
loginRouter.use('/login',(req,res)=>{
	//console.log(req.query);
	databasePool.getConnection((err,connection)=>{
		if (err) {
			console.log(err);
			res.send({'ok':0,'msg':'Fail connection'});
		}
		else{
			//检测用户名密码,判断是否登录成功
			console.log(req.query.username);
			//验证用户名是否是邮箱？
			if(req.query.username.indexOf("@")!=-1){
				connection.query('SELECT mailbox,password,username,active FROM `user_table` WHERE BINARY mailbox="'+req.query.username+'"',(err,data)=>{
				if(err) {
					console.log(err);
					res.send({'ok':0,'msg':'Fail connection'});
					connection.end();
				}	
				else{
						if(data.length>0) {
							let userdata = data;
							console.log(userdata);
							//判断激活状态
							if(userdata[0].active==0){
								console.log("Account is not activated");
								res.send({'ok':-1,'msg':'Account is not activated'});
								connection.end();
							}
							else{
								//判断password
								if(userdata[0].password==req.query.password){
									connection.query('SELECT fileName,hashName,lastTime,size,downloadTime,typeis FROM `'+userdata[0].username+'`;',(err,data)=>{
										if (err) {
											console.log(err);
											res.send({'ok':0,'msg':'Fail connection'});
										}
										else{
											let filedata = data;
											connection.query('SELECT used_memory,max_memory FROM `user_table` WHERE  mailbox="'+req.query.username+'" ',(err,data)=>{
												if (err) {
													console.log(err);
											        res.send({'ok':0,'msg':'Fail select memory'});

												}
												else{
													console.log(data[0].used_memory+"登陆成功节点");
													console.log(data[0].max_memory);
													res.send({'ok':1,'msg':'Login success','data':filedata,'memorydata':data,'userData':userdata});
													//console.log(data.data[0].size);
													
												}
										        });
								

							                }
							                connection.end();
						            });
								}
								else{
									console.log("Wrong username or password");
									res.send({'ok':0,'msg':'Wrong username or password'});
									connection.end();
								}
								
							}
						
						
					}
					else{
						
						res.send({'ok':0,'msg':'Wrong mailbox or password'});
						connection.end;
					}
					//connection.end();
					}
					
				
			});

			}
			else{ 
				    
					connection.query('SELECT username,password,active FROM `user_table` WHERE BINARY username="'+req.query.username+'" AND BINARY password="'+req.query.password+'";',(err,data)=>{
				if(err) {
					console.log(err);
					res.send({'ok':0,'msg':'Fail connection'});
					connection.end();
				}	
					else{
					    if(data.length>0) {
							let userdata = data;
							console.log(userdata);
							if(userdata[0].active==0){
								console.log("Account is not activated");
								res.send({'ok':-1,'msg':'Account is not activated'});
								connection.end();
							}
							else{
								if(userdata[0].password==req.query.password){
											connection.query('SELECT fileName,hashName,lastTime,size,downloadTime,typeis FROM `'+userdata[0].username+'`;',(err,data)=>{
								if (err) {
									console.log(err);
									res.send({'ok':0,'msg':'Fail connection'});
								}
								else{
									let filedata = data;
									connection.query('SELECT used_memory,max_memory FROM `user_table` WHERE  username="'+req.query.username+'" ',(err,data)=>{
										if (err) {
											console.log(err);
									        res.send({'ok':0,'msg':'Fail select memory'});

										}
										else{
											console.log(data[0].used_memory+"登陆成功节点");
											console.log(data[0].max_memory);
											res.send({'ok':1,'msg':'Login success','data':filedata,'memorydata':data,'userData':userdata});
											//console.log(data.data[0].size);
											
										}
									});
									

								}
								connection.end();
							});
						}
							else{
								console.log("Wrong username or password");
								res.send({'ok':0,'msg':'Wrong username or password'});
								connection.end();
							}
						
							}
						
							
						}
					else{
						
						res.send({'ok':0,'msg':'Wrong username or password'});
						connection.end;
					}
					//connection.end();

					}
					
				
			});
          
			}

		
		}
	});
});


loginRouter.use('/rename',(req,res)=>{
	// console.log(req.query.username);
	databasePool.getConnection((err,connection)=>{
		if (err) {
			console.log(err);
			res.send({ok:0,msg:'Rename fail'});
			connection.end();
		}
		else{
			connection.query('SELECT fileName FROM `allFiles` WHERE hashName = "'+req.query.hashName+'" AND fileOwner="'+req.query.username+'";',(err,data)=>{
				if (err) {
					console.log(err);
					res.send({ok:0,msg:'rename fail'});
					connection.end();
				}
				else{
					connection.query('UPDATE `allFiles` SET fileName="'+req.query.newName+'" WHERE hashName = "'+req.query.hashName+'" AND fileOwner="'+req.query.username+'";',(err,data)=>{
						if (err) {
							console.log(err);
							res.send({ok:0,msg:'rename fail'});
							connection.end();
						}
						else{
							connection.query('UPDATE `'+req.query.username+'` SET fileName="'+req.query.newName+'" WHERE hashName = "'+req.query.hashName+'";',(err,data)=>{
								if (err) {
									console.log(err);
									res.send({ok:0,msg:'rename fail'});
									connection.end();
								}
								else{
									console.log(req.query.username)
									console.log(req.query.newName)
									console.log(req.query.hashName)
									res.send({ok:1,msg:'rename success'});
								}
								connection.end();
							})
						}
					})
				}
			})
		}
	})
});

//////////////////////////////////////////A    P    I//////////////////////////////////////////////////////////////

//login
apiRouter.use('/login',(req,res)=>{
	//console.log(req.query);
	databasePool.getConnection((err,connection)=>{
		if (err) {
			console.log(err);
			res.send({'ok':0,'msg':'Fail connection'});
		}
		else{
			//检测用户名密码,判断是否登录成功
			console.log(req.query.username);
			if(req.query.username == null){
				res.send({'ok':0,'msg':'wrong username or password'});
				connection.end();
			}
			//验证用户名是否是邮箱？
			else if(req.query.username.indexOf("@")!=-1){
				connection.query('SELECT mailbox,password,username,active FROM `user_table` WHERE BINARY mailbox="'+req.query.username+'"',(err,data)=>{
				if(err) {
					console.log(err);
					res.send({'ok':0,'msg':'Fail connection'});
					connection.end();
				}	
				else{
						if(data.length>0) {
							let userdata = data;
							console.log(userdata);
							//判断激活状态
							if(userdata[0].active==0){
								console.log("Account is not activated");
								res.send({'ok':-1,'msg':'Account is not activated'});
								connection.end();
							}
							else{
								//判断password
								if(userdata[0].password==req.query.password){
									connection.query('SELECT fileName,hashName,lastTime,size,downloadTime,typeis FROM `'+userdata[0].username+'`;',(err,data)=>{
										if (err) {
											console.log(err);
											res.send({'ok':0,'msg':'Fail connection'});
										}
										else{
											let filedata = data;
											connection.query('SELECT used_memory,max_memory FROM `user_table` WHERE  mailbox="'+req.query.username+'" ',(err,data)=>{
												if (err) {
													console.log(err);
											        res.send({'ok':0,'msg':'Fail select memory'});

												}
												else{
													console.log(data[0].used_memory+"登陆成功节点");
													console.log(data[0].max_memory);
													res.send({'ok':1,'msg':'Login success','data':filedata,'memorydata':data,'userData':userdata});
													//console.log(data.data[0].size);
													
												}
										        });
								

							                }
							                connection.end();
						            });
								}
								else{
									console.log("Wrong username or password");
									res.send({'ok':0,'msg':'Wrong username or password'});
									connection.end();
								}
								
							}
						
						
					}
					else{
						
						res.send({'ok':0,'msg':'Wrong mailbox or password'});
						connection.end;
					}
					//connection.end();
					}
					
				
			});

			}
			else{ 
				    
					connection.query('SELECT username,password,active FROM `user_table` WHERE BINARY username="'+req.query.username+'" AND BINARY password="'+req.query.password+'";',(err,data)=>{
				if(err) {
					console.log(err);
					res.send({'ok':0,'msg':'Fail connection'});
					connection.end();
				}	
					else{
					    if(data.length>0) {
							let userdata = data;
							console.log(userdata);
							if(userdata[0].active==0){
								console.log("Account is not activated");
								res.send({'ok':-1,'msg':'Account is not activated'});
								connection.end();
							}
							else{
								if(userdata[0].password==req.query.password){
											connection.query('SELECT fileName,hashName,lastTime,size,downloadTime,typeis FROM `'+userdata[0].username+'`;',(err,data)=>{
								if (err) {
									console.log(err);
									res.send({'ok':0,'msg':'Fail connection'});
								}
								else{
									let filedata = data;
									connection.query('SELECT used_memory,max_memory FROM `user_table` WHERE  username="'+req.query.username+'" ',(err,data)=>{
										if (err) {
											console.log(err);
									        res.send({'ok':0,'msg':'Fail select memory'});

										}
										else{
											console.log(data[0].used_memory+"登陆成功节点");
											console.log(data[0].max_memory);
											res.send({'ok':1,'msg':'Login success','data':filedata,'memorydata':data,'userData':userdata});
											//console.log(data.data[0].size);
											
										}
									});
									

								}
								connection.end();
							});
						}
							else{
								console.log("wrong username or password");
								res.send({'ok':0,'msg':'wrong username or password'});
								connection.end();
							}
						
							}
						
							
						}
					else{
						
						res.send({'ok':0,'msg':'Wrong username or password'});
						connection.end;
					}
					//connection.end();

					}
					
				
			});
          
			}

		
		}
	});
});


//register
apiRouter.use('/res',(req,res)=>{
	//console.log(req.query);
	databasePool.getConnection((err,connection)=>{
		if (err) {
			console.log(err);
			res.send({'ok':0,'msg':'Fail connection'});
		}
		else{
			connection.query('SELECT username FROM `user_table` WHERE BINARY username="'+req.query.username+'";',(err,data)=>{
				if(err) {
					console.log(err);
					res.send({'ok':0,'msg':'Fail connection'});
					connection.end();
				}	
				else{
					//判断用户是否存在
					if(data.length>0) {
						res.send({'ok':0,'msg':'User exist'});
						connection.end();
					}
					else{
						//user_table里面创建用户
						connection.query('INSERT INTO `user_table` (`username`,`password`,`used_memory`,`max_memory`,`mailbox`) VALUES("'+req.query.username+'","'+req.query.password+'","'+req.query.used_memory+'","'+req.query.max_memory+'","'+req.query.mailbox+'");',(err,data)=>{
							if (err) {
								console.log(err);
								res.send({'ok':0,'msg':'Fail connection'});
								connection.end();
							}
							else{
								//为用户创建个人表
								//纯数字表不能创建,不能带特殊符号
								connection.query(`CREATE TABLE ${req.query.username} 
										(
										ID int(255) NOT NULL AUTO_INCREMENT,
										fileName varchar(255) NOT NULL,
										hashName varchar(255) NOT NULL,
										lastTime varchar(255) NOT NULL,
										typeis varchar(255),
										size varchar(255) NOT NULL,
										downloadTime varchar(255) NOT NULL,
										PRIMARY KEY (ID)
									)`,(err,data)=>{
										if (err) {
											console.log(err);
										}
										else{
											res.send({'ok':1,'msg':'Create user success'});
										};
										connection.end();
									})
							}
							
						});
					}
				}
			});
		}
	});
});

apiRouter.use('/showfile',(req,res)=>{
	//req 
	//
	//console.log(req.query);
	databasePool.getConnection((err,connection)=>{
		if (err) {
			console.log(err);
			res.send({'ok':0,'msg':'Fail connection'});
		}
		else{
			//检测用户名密码,判断是否登录成功
			connection.query('SELECT username,password FROM `user_table` WHERE BINARY username="'+req.query.username+'" AND BINARY password="'+req.query.password+'";',(err,data)=>{
				if(err) {
					console.log(err);
					res.send({'ok':0,'msg':'Fail connection'});
					connection.end();
				}	
				else{
					if(data.length>0) {

						connection.query('SELECT fileName,hashName,lastTime,size,downloadTime,typeis FROM `'+req.query.username+'`;',(err,data)=>{
							if (err) {
								console.log(err);
								res.send({'msg':'Fail connection'});
							}
							else{
								res.send({'file':data});

							}
							connection.end();
						});
						
					}
					else{
						res.send({'msg':'Wrong username or password'});
						connection.end;
					}
					//connection.end();
				}
			});
		}
	});
});

apiRouter.use('/download',(req,res)=>{
	//fs.unlink('./SUPFile/allFiles/'+req.query.hashName,(err)=>{
	//	if (err) {
	//		console.log(err);
	//		res.send({ok:0,msg:'delete file failed'});
	//	}
	//	else{

	databasePool.getConnection((err,connection)=>{
		if (err) {
			console.log(err);
			res.send({'ok':0,'msg':'Fail connection'});
		}
		else{
			//检测用户名密码,判断是否登录成功
			connection.query('SELECT username,password FROM `user_table` WHERE BINARY username="'+req.query.username+'" AND BINARY password="'+req.query.password+'";',(err,data)=>{
				if(err) {
					console.log(err);
					res.send({'ok':0,'msg':'Fail connection'});
					connection.end();
				}	
				else{
					if(data.length>0) {

						connection.query('SELECT fileName,hashName,lastTime,size,downloadTime,typeis FROM `'+req.query.username+'`;',(err,data)=>{
							if (err) {
								console.log(err);
								res.send({'ok':0,'msg':'Fail connection'});
								connection.end();
							}
							else{
								//res.send({'ok':1,'msg':'Login success'});
								connection.end();
								databasePool.getConnection((err,connection)=>{
									if (err) {
										console.log(err);
										res.send({ok:0,msg:'Download file failed'});
									}
									else{
										connection.query('SELECT * FROM `'+req.query.username+'` WHERE fileName="'+req.query.fileName+'";',(err,data)=>{
											if ((err)||(data.length==0)) {
												console.log(err);
												res.send({ok:0,msg:'Download file failed'});
												connection.end();
											}
											else{
												connection.query('SELECT hashName FROM `allFiles` WHERE fileName="'+req.query.fileName+'" AND fileOwner="'+req.query.username+'";',(err,data)=>{
													if ((err)||(data.length==0)) {
														console.log(err);
														res.send({ok:0,msg:'Download file failed'});
													}
													else{
														//var x=data.hashName;
														res.send({msg:'Download file with following address',address:hostandport+'/allFiles/'+data[0].hashName});
													}
													connection.end();
												})
												
											}
											
										})
									}
								})




							}
							
						});
						
					}
					else{
						res.send({'ok':0,'msg':'Wrong username or password'});
						connection.end;
					}
					//connection.end();
				}
			});
		}
	});




			

	//	}
	//})
});




apiRouter.use('/rename',(req,res)=>{
	// console.log(req.query.username);

	databasePool.getConnection((err,connection)=>{
		if (err) {
			console.log(err);
			res.send({'ok':0,'msg':'Fail connection'});
		}
		else{
			//检测用户名密码,判断是否登录成功
			connection.query('SELECT username,password FROM `user_table` WHERE BINARY username="'+req.query.username+'" AND BINARY password="'+req.query.password+'";',(err,data)=>{
				if(err) {
					console.log(err);
					res.send({'ok':0,'msg':'Fail connection'});
					connection.end();
				}	
				else{
					if(data.length>0) {

						connection.query('SELECT fileName,hashName,lastTime,size,downloadTime,typeis FROM `'+req.query.username+'`;',(err,data)=>{
							if (err) {
								console.log(err);
								res.send({'ok':0,'msg':'Fail connection'});
								connection.end();
							}
							else{
								//res.send({'ok':1,'msg':'Login success'});
								connection.end();
								databasePool.getConnection((err,connection)=>{
									if (err) {
										console.log(err);
										res.send({ok:0,msg:'Rename fail'});
										connection.end();
									}
									else{
										connection.query('SELECT fileName FROM `allFiles` WHERE fileName = "'+req.query.fileName+'" AND fileOwner="'+req.query.username+'";',(err,data)=>{
											if (err) {
												console.log(err);
												res.send({ok:0,msg:'Rename fail'});
												connection.end();
											}
											else{
												connection.query('UPDATE `allFiles` SET fileName="'+req.query.newName+'" WHERE fileName = "'+req.query.fileName+'" AND fileOwner="'+req.query.username+'";',(err,data)=>{
													if (err) {
														console.log(err);
														res.send({ok:0,msg:'Rename fail'});
														connection.end();
													}
													else{
														connection.query('UPDATE `'+req.query.username+'` SET fileName="'+req.query.newName+'" WHERE fileName = "'+req.query.fileName+'";',(err,data)=>{
															if (err) {
																console.log(err);
																res.send({ok:0,msg:'Rename fail'});
																connection.end();
															}
															else{
																console.log(req.query.username)
																console.log(req.query.newName)
																console.log(req.query.fileName)
																res.send({ok:1,msg:'Rename success'});
															}
															connection.end();
														})
													}
												})
											}
										})
									}
								})
								

							}
							
						});
						
					}
					else{
						res.send({'ok':0,'msg':'Wrong username or password'});
						connection.end;
					}
					//connection.end();
				}
			});
		}
	});
});

apiRouter.use('/sharefile',(req,res)=>{
	databasePool.getConnection((err,connection) =>{
		if(err){
			console.log(err);
			res.send({'ok':0,'msg':'Fail connection'});
		}
		else{
			connection.query('SELECT * FROM `allFiles` WHERE hashName = "'+req.query.hashName+'" ;',(err,data)=>{
				if (err) {
					console.log(err);
			        res.send({'ok':0,'msg':'The file does not exist or is broken'});
				}
				else{
					console.log(data[0]);
					res.send({'msg':'You can share with following address','address':hostandport+'/share.html?shareFile='+data[0].hashName});
				}
				connection.end();
				
				
			});
		
		}
	});
})

server.use('/',express.static('./SUPFile'));


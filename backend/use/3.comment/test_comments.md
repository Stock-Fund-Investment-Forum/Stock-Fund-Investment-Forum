## boards
![alt text](image.png)
- 创建板块：![alt text](image-1.png)，板块类型只能是这几个
  ![alt text](image-2.png)
- 获取相应板块类型列表：![alt text](image-3.png)
- 通过板块id获取板块信息：![alt text](image-4.png)
- 通过板块id更新板块信息：![alt text](image-5.png)
- 订阅板块：![alt text](image-6.png)
- 取消订阅板块：![alt text](image-7.png)
## posts
- 创建帖子：![alt text](image-10.png)，帖子类型只能是这几个
  ![alt text](image-8.png)
- 获取帖子列表：![alt text](image-9.png)，只显示状态为PUBLISHED的帖子，必须填帖子类型参数  可以用这几种筛选，亦可以都不用，显示全部，![alt text](image-26.png)
- 通过帖子id获取帖子信息：![alt text](image-11.png)
- 通过帖子id更新帖子信息：![alt text](image-13.png)帖子状态只能是这几个，![alt text](image-12.png)
- 删除帖子：![alt text](image-14.png)帖子状态变为DELETED
- 通过帖子id点赞帖子：![alt text](image-15.png)
- 通过帖子id取消点赞帖子：![alt text](image-16.png)，无点赞记录时返回200
## comments
- 创建评论：![alt text](image-17.png)，可以选择父评论id进行回复，父评论id不存在时返回400，评价post的一级评论时parent_comment_id不传（置空），评价post的二级评论时parent_comment_id为一级评论id
- 通过postid获取评论列表：![alt text](image-18.png)
- 通过评论id获取评论信息：![alt text](image-19.png)
- 通过评论id更新评论信息：![alt text](image-20.png)
- 通过评论id删除评论：![alt text](image-21.png) 无评论返回404
- 通过评论id点赞评论：![alt text](image-22.png)
- 通过评论id取消点赞评论：![alt text](image-23.png) 无点赞记录时返回200
## tags
- 获取标签列表：![alt text](image-24.png)
- 通过标签id获取标签信息：![alt text](image-25.png)
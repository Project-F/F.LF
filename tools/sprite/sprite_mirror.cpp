#include <stdio.h>
#include <png.h>
#include "png_readwrite.cpp"
/* tool to mirror each frame of a sprite horizontally
 * following the same config with F.sprite
 * sample usage:
	echo test_sprite.png out.png 0 0 100 100 4 4 n | ./sprite_mirror
 * to run on linux on a NTFS without `executing file as program permission` :
	/lib/ld-linux.so.2 sprite_mirror
 */

//compile this with g++ by: g++ sprite_mirror.cpp -lpng -o sprite_mirror

void swap_pixel(unsigned char* img, int w,int b, int x1,int y1, int x2,int y2)
{
	unsigned char R = img[y1*w*b+x1*b];
	unsigned char G = img[y1*w*b+x1*b+1];
	unsigned char B = img[y1*w*b+x1*b+2];
	unsigned char A = img[y1*w*b+x1*b+3];
	
	img[y1*w*b+x1*b] = img[y2*w*b+x2*b];
	img[y1*w*b+x1*b+1] = img[y2*w*b+x2*b+1];
	img[y1*w*b+x1*b+2] = img[y2*w*b+x2*b+2];
	img[y1*w*b+x1*b+3] = img[y2*w*b+x2*b+3];
	
	img[y2*w*b+x2*b] = R;
	img[y2*w*b+x2*b+1] = G;
	img[y2*w*b+x2*b+2] = B;
	img[y2*w*b+x2*b+3] = A;
}

void mirror_cell(unsigned char* img, int width,int b, int x,int y, int w,int h)
{
	for( int j=0; j<h; j++)
		for( int i=0; i<w/2; i++)
			swap_pixel(img,width,b, x+i,y+j, x+w-i-1,y+j);
}

void mirror_grid(unsigned char* img, int width,int b, int x,int y,int w,int h,int gx,int gy)
{
	for ( int cx=0; cx<gx; cx++)
		for ( int cy=0; cy<gy; cy++)
			mirror_cell(img,width,b, cx*w,cy*h, w,h);
}

int main( int argc, char** argv)
{
	char in_file[100]={0};
	char out_file[100]={0};
	printf("input file name: ");
	scanf("%100s",in_file);
	printf("output file name: ");
	scanf("%100s",out_file);
	
	const int L=100;
	int x[L],y[L],w[L],h[L],gx[L],gy[L],cc=0;
	do {
		printf("\ngrid %d: ", cc);
		printf("\ntop left margin x: "); scanf("%d",&x[cc]);
		printf("top left margin y: "); scanf("%d",&y[cc]);
		printf("size of a frame w: "); scanf("%d",&w[cc]);
		printf("size of a frame h: "); scanf("%d",&h[cc]);
		printf("a gx*gy grid of frames gx: "); scanf("%d",&gx[cc]);
		printf("a gx*gy grid of frames gy: "); scanf("%d",&gy[cc]);
		cc++;
		
		char con[100];
		printf("continue?(y/n) "); scanf("%100s",con);
		if( con[0] != 'y') break;
	} while( cc<L);

	printf("\n");
	int width,height,byte;
	unsigned char* buffer = read_png(in_file, &width,&height,&byte);
	
	for ( int i=0; i<cc; i++)
	{
		mirror_grid(buffer,width,byte, x[i],y[i],w[i],h[i],gx[i],gy[i]);
	}
	
	save_png( out_file, buffer, width,height,byte);

	return 1;
}

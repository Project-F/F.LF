#include <stdio.h>
#include <png.h>
/* tool to mirror each frame of a sprite horizontally
 * following the same config with F.sprite
 * sample usage:
	echo test_sprite.png out.png 0 0 100 100 4 4 n | ./sprite_mirror
 * to run on linux on a NTFS without `executing file as program permission` :
	/lib/ld-linux.so.2 sprite_mirror
 */

//compile this with g++ by: g++ sprite_mirror.cpp -lpng -o sprite_mirror

int					// 0 on failure, 1 on success
save_png(const char *filename,		// filename
	unsigned char* buffer,		// buffer of an image
	int w,				// width of image
	int h,				// height
	int b)				// color depth/ bytes per pixel
{
	int				y;		// Current row
	const unsigned char		*ptr;		// Pointer to image data
	FILE				*fp;		// File pointer
	png_structp			pp;		// PNG data
	png_infop			info;		// PNG image info

	if ( !filename)
	{
		printf("invalid filename.\n");
		return 0;
	}
	if ( !buffer)
	{
		printf("null pointer buffer.\n");
		return 0;
	}
	
	// Create the output file...
	if ((fp = fopen(filename, "wb")) == NULL)
	{
		printf("Unable to create PNG image.\n");
		return (0);
	}

	// Create the PNG image structures...
	pp = png_create_write_struct(PNG_LIBPNG_VER_STRING, 0, 0, 0);
	if (!pp)
	{
		fclose(fp);
		printf("Unable to create PNG data.\n");
		return (0);
	}

	info = png_create_info_struct(pp);
	if (!info)
	{
		fclose(fp);
		png_destroy_write_struct(&pp, 0);
		printf("Unable to create PNG image information.\n");
		return (0);
	}

	if (setjmp(png_jmpbuf(pp)))
	{
		fclose(fp);
		png_destroy_write_struct(&pp, &info);
		printf("Unable to write PNG image.\n");
		return (0);
	}

	png_init_io(pp, fp);

	png_set_compression_level(pp, Z_BEST_COMPRESSION);
	png_set_IHDR(pp, info, w, h, 8,
	       b==3? PNG_COLOR_TYPE_RGB : PNG_COLOR_TYPE_RGB_ALPHA,
	       PNG_INTERLACE_NONE, PNG_COMPRESSION_TYPE_DEFAULT,
	       PNG_FILTER_TYPE_DEFAULT);
	png_set_sRGB(pp, info, PNG_sRGB_INTENT_PERCEPTUAL);
	png_set_sRGB_gAMA_and_cHRM(pp, info, PNG_INFO_sRGB);
	
	png_write_info(pp, info);
	
	ptr = buffer;
	
	for (y = 0; y < h; y ++)
	{
		png_write_row(pp, (png_byte *)ptr);
		ptr += w*b;
	}

	png_write_end(pp, info);
	png_destroy_write_struct(&pp, 0);

	fclose(fp);
	return (1);
}


unsigned char*				// 0 on failure, address of memory buffer on success
					// must *delete[]* the buffer manually after use
read_png( const char* filename,		// filename
	int* width,			// store image width into pointer
	int* height,			// store image height into pointer
	int* channels)			// number of channels
{
	int		i;			// Looping var
	FILE		*fp;			// File pointer
	png_structp	pp;			// PNG read pointer
	png_infop	info;			// PNG info pointers
	png_bytep	*rows;			// PNG row pointers

	// Open the PNG file...
	if ((fp = fopen(filename, "rb")) == NULL)
	{
		printf( "Unable to open file %s.\n", filename);
		return 0;
	}

	// Setup the PNG data structures...
	pp   = png_create_read_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
	info = png_create_info_struct(pp);

	if (setjmp(pp->jmpbuf))
	{
		printf("Unable to read. png file %s contains errors.\n", filename);
		return 0;
	}

	// Initialize the PNG read "engine"...
	png_init_io(pp, fp);

	// Get the image dimensions and convert to grayscale or RGB...
	png_read_info(pp, info);

	if (info->color_type == PNG_COLOR_TYPE_PALETTE)
	png_set_expand(pp);

	if (info->color_type & PNG_COLOR_MASK_COLOR)
	*channels = 3;
	else
	*channels = 1;

	if ((info->color_type & PNG_COLOR_MASK_ALPHA) || info->num_trans)
	(*channels) ++;

	if ( *channels != 3 && *channels != 4)
	{
		printf("png image other than 3 or 4 channels is not supported.\n");
		return 0;
	}

	*width = info->width;
	*height = info->height;

	if (info->bit_depth < 8)
	{
	png_set_packing(pp);
	png_set_expand(pp);
	}
	else if (info->bit_depth == 16)
	png_set_strip_16(pp);

	// Handle transparency...
	if (png_get_valid(pp, info, PNG_INFO_tRNS))
	png_set_tRNS_to_alpha(pp);

	unsigned char* array = new unsigned char[(*width) * (*height) * (*channels)];

	// Allocate pointers...
	rows = new png_bytep[(*height)];

	for (i = 0; i < (*height); i ++)
	rows[i] = (png_bytep)(array + i * (*width) * (*channels));

	// Read the image, handling interlacing as needed...
	for (i = png_set_interlace_handling(pp); i > 0; i --)
	png_read_rows(pp, rows, NULL, (*height));

	#ifdef WIN32
	// Some Windows graphics drivers don't honor transparency when RGB == white
	if (*channels == 4) {
	// Convert RGB to 0 when alpha == 0...
	unsigned char* ptr = (unsigned char*) array;
	for (i = (*width) * (*height); i > 0; i --, ptr += 4)
	if (!ptr[3]) ptr[0] = ptr[1] = ptr[2] = 0;
	}
	#endif //WIN32

	// Free memory
	delete[] rows;

	png_read_end(pp, info);
	png_destroy_read_struct(&pp, &info, NULL);

	fclose(fp);

	return array;
}

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

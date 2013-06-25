cd ../docs
cp -r * ../../LFrelease/docs
cd ../../LFrelease/docs
#echo "rename all .md to .html"
#for filename in $(ls *.md | sed 's/ /__/g')
#do
#  filename="$(echo $filename | sed 's/__/ /g')"
#  newname="$(basename $filename .md).html"
#  mv "$filename" "$newname"
#done

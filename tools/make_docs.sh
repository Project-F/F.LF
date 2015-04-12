cd ../docs
#in LF/docs
cp -r * ../../LFrelease/docs
cd ../
#in LF/
cp index.html ../LFrelease
#echo "rename all .md to .html"
#for filename in $(ls *.md | sed 's/ /__/g')
#do
#  filename="$(echo $filename | sed 's/__/ /g')"
#  newname="$(basename $filename .md).html"
#  mv "$filename" "$newname"
#done

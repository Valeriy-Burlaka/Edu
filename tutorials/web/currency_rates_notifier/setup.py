from setuptools import setup


__version__ = "0.0.1"

install_requires = [
    "setuptools==34.3.2",
    "aiohttp==1.3.5",
    "beautifulsoup4==4.5.3",
    "lxml==3.7.3",
    "boto3==1.4.4",
    "requests==2.13.0"
]

setup(
    name="async-edu",
    version=__version__,
    packages=["app"],
    author="(todo)",
    description="(TODO_)",
    install_requires=install_requires
)
